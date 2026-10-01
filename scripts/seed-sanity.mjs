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

// Expanded scientific instrument taxonomy
const taxonomy = [
  {
    category: 'Chromatography & Mass Spectrometry',
    description: 'Hardware for gas/liquid phase separation and molecular mass determination.',
    products: [
      'Gas Chromatograph 3000',
      'HPLC Chromatography Column',
      'Quadrupole Mass Spectrometer',
      'Ultra-Performance Liquid Chromatograph',
      'Ion Mobility Spectrometer'
    ],
    articles: [
      { title: 'Optimizing Mobile Phase Retention in LC-MS', type: 'whitepaper' },
      { title: 'Routine Maintenance Protocol for Gas Injection Inlets', type: 'protocol' }
    ]
  },
  {
    category: 'Microscopy & Imaging Systems',
    description: 'Optical, electron, and probe instruments for nanoscale imaging.',
    products: [
      'Transmission Electron Microscope Pro',
      'Confocal Laser Scanning Microscope',
      'Atomic Force Microscope FX',
      'Fluorescence Live-Cell Imaging Station'
    ],
    articles: [
      { title: 'Cryo-EM Sample Preparation Best Practices', type: 'protocol' },
      { title: 'Comparing Resolution Limits: SEM vs AFM', type: 'application_note' }
    ]
  },
  {
    category: 'Laboratory Automation & Robotics',
    description: 'Automated liquid handling, microplate processing, and high-throughput screening.',
    products: [
      'Automated 8-Channel Liquid Handler',
      'High-Speed Microplate Reader',
      'Refrigerated Centrifuge 5000',
      'Automated Nucleic Acid Extractor'
    ],
    articles: [
      { title: 'High-Throughput Assay Optimization Protocol', type: 'protocol' }
    ]
  },
  {
    category: 'Spectroscopy & Elemental Analysis',
    description: 'Instruments for atomic absorption, UV-Vis, FTIR, and optical emission.',
    products: [
      'FTIR Spectrometer Alpha',
      'Atomic Absorption Spectrophotometer',
      'UV-Vis Double-Beam Spectrophotometer',
      'Inductively Coupled Plasma Mass Spectrometer'
    ],
    articles: [
      { title: 'Interference Removal Techniques in ICP-MS Analysis', type: 'whitepaper' }
    ]
  }
]

const manufacturersData = [
  { name: 'LabCorp Scientific', website: 'https://labcorp.example.com', desc: 'Global leader in laboratory hardware and analytical devices.' },
  { name: 'NanoView Instruments', website: 'https://nanoview.example.com', desc: 'Pioneers in high-resolution atomic imaging systems.' },
  { name: 'Separations Inc', website: 'https://separations.example.com', desc: 'Specialized chromatography columns and consumables supplier.' },
  { name: 'Apex Analytical', website: 'https://apexanalytical.example.com', desc: 'High-throughput automation and spectrographic hardware manufacturer.' }
]

async function seed() {
  console.log('🚀 Starting Expanded Sanity Graph Seeding...')

  // 1. Seed Manufacturers
  console.log('\n--- Seeding Manufacturers ---')
  const manufacturerMap = {}
  for (const mfg of manufacturersData) {
    const createdMfg = await sanity.create({
      _type: 'manufacturer',
      name: mfg.name,
      slug: { current: mfg.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      website: mfg.website,
      description: mfg.desc,
    })
    manufacturerMap[mfg.name] = createdMfg._id
    console.log(`Created Manufacturer: ${mfg.name}`)
  }

  const mfgIds = Object.values(manufacturerMap)

  // 2. Loop through Taxonomy Categories, Products, and Articles
  for (const group of taxonomy) {
    console.log(`\n--- Seeding Category: ${group.category} ---`)
    
    // Create Category Document
    const categoryDoc = await sanity.create({
      _type: 'category',
      title: group.category,
      slug: { current: group.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      description: group.description,
    })

    const createdProductIds = []

    // Seed Products for this Category
    for (const productName of group.products) {
      console.log(`Generating AI content for Product: "${productName}"...`)
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Generate detailed scientific metadata JSON for a laboratory instrument named "${productName}". 
          Return JSON object with keys:
          - description: 2-3 paragraph main product overview.
          - metaDescription: concise meta description under 150 chars.
          - faqs: array of 2 objects containing "question" and "answer" properties.`
        }],
        response_format: { type: "json_object" }
      })

      const data = JSON.parse(response.choices[0].message.content)
      const randomMfgId = mfgIds[Math.floor(Math.random() * mfgIds.length)]

      const productDoc = await sanity.create({
        _type: 'product',
        title: productName,
        slug: { current: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        category: { _type: 'reference', _ref: categoryDoc._id },
        manufacturer: { _type: 'reference', _ref: randomMfgId },
        description: data.description,
        metaDescription: data.metaDescription,
        faqs: data.faqs || [],
      })

      createdProductIds.push(productDoc._id)
      console.log(`Created Product: ${productName}`)
    }

    // Seed Articles for this Category linked to Products
    for (const articleInfo of group.articles) {
      console.log(`Generating AI content for Article: "${articleInfo.title}"...`)

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Generate scientific knowledge base content JSON for an article titled "${articleInfo.title}".
          Return JSON object with keys:
          - summary: 2-sentence executive summary.
          - bodyText: 3-paragraph detailed guide/protocol text.`
        }],
        response_format: { type: "json_object" }
      })

      const data = JSON.parse(response.choices[0].message.content)
      
      // Select 1-2 random products from this category to relate to the article
      const relatedProductRefs = createdProductIds.slice(0, 2).map((pId, idx) => ({
        _type: 'reference',
        _ref: pId,
        _key: `rel_prod_${idx}`
      }))

      await sanity.create({
        _type: 'article',
        title: articleInfo.title,
        slug: { current: articleInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        articleType: articleInfo.type,
        summary: data.summary,
        category: { _type: 'reference', _ref: categoryDoc._id },
        relatedProducts: relatedProductRefs,
        body: [
          {
            _type: 'block',
            children: [{ _type: 'span', text: data.bodyText }]
          }
        ]
      })

      console.log(`Created Article: ${articleInfo.title}`)
    }
  }

  console.log('\n=============================================')
  console.log('✅ Sanity Knowledge Graph Seeding Complete!')
  console.log('=============================================')
}

seed().catch(console.error)