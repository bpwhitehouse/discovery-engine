import { createClient } from '@sanity/client'
import OpenAI from 'openai'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
})

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Broad scientific domain catalog for testing hybrid & vector search
const catalogData = [
  { category: 'Analytical Instruments', items: ['Gas Chromatograph 3000', 'NMR Spectrometer 600', 'Atomic Absorption Spectrophotometer'] },
  { category: 'Microscopy & Imaging', items: ['Confocal Laser Microscope', 'Scanning Electron Microscope Pro', 'Fluorescence Microscope FX'] },
  { category: 'Lab Automation & Robotics', items: ['Automated Liquid Handler', 'Microplate Reader Ultra', 'Centrifuge High-Speed 5000'] },
  { category: 'Sample Preparation', items: ['Freeze Dryer Lyophilizer', 'Ultrasonic Homogenizer', 'Rotary Evaporator RE-200'] },
]

const manufacturers = ['LabCorp', 'ThermoTech Scientific', 'BioMatrix Instruments', 'Apex Analytics']

async function seedDatabase() {
  console.log('Seeding Categories & Manufacturers...')
  
  // 1. Seed Categories
  const categoryDocs = {}
  for (const group of catalogData) {
    const catDoc = await sanity.create({
      _type: 'category',
      title: group.category,
      slug: { current: group.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      description: `High-performance scientific equipment in ${group.category}.`,
    })
    categoryDocs[group.category] = catDoc._id
  }

  // 2. Seed Manufacturers
  for (const mfg of manufacturers) {
    await sanity.create({
      _type: 'manufacturer',
      name: mfg,
      slug: { current: mfg.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      description: `${mfg} is a premier manufacturer of precision scientific lab hardware.`,
    })
  }

  // 3. Seed Products with Rich Details
  console.log('Generating product metadata with OpenAI...')
  for (const group of catalogData) {
    for (const item of group.items) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Generate structured JSON for a scientific instrument product named "${item}". 
          Include: 150-char metaDescription, detailed main description, 3 technical specs (key-value), and 3 FAQs (question/answer).`
        }],
        response_format: { type: "json_object" }
      })

      const data = JSON.parse(response.choices[0].message.content)

      await sanity.create({
        _type: 'product',
        title: item,
        slug: { current: item.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        category: group.category,
        manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
        description: data.description,
        metaDescription: data.metaDescription,
        faqs: data.faqs || [],
      })
      console.log(`Created: ${item}`)
    }
  }
  console.log('Seeding Complete!')
}

seedDatabase()