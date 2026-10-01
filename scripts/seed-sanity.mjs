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

async function seed() {
  console.log('Seeding Categories & Manufacturers...')

  // 1. Create Category
  const category = await sanity.create({
    _type: 'category',
    title: 'Chromatography & Mass Spectrometry',
    slug: { current: 'chromatography-mass-spectrometry' },
    description: 'Analytical instruments for substance separation and identification.',
  })

  // 2. Create Manufacturer
  const mfg = await sanity.create({
    _type: 'manufacturer',
    name: 'LabCorp Scientific',
    slug: { current: 'labcorp-scientific' },
    website: 'https://example.com',
    description: 'Leader in high-precision laboratory hardware.',
  })

  // 3. Create Product linked via references
  console.log('Seeding Product...')
  const product = await sanity.create({
    _type: 'product',
    title: 'Gas Chromatograph 3000',
    slug: { current: 'gas-chromatograph-3000' },
    category: { _type: 'reference', _ref: category._id },
    manufacturer: { _type: 'reference', _ref: mfg._id },
    description: 'High-speed gas chromatography system equipped with capillary columns.',
    metaDescription: 'Precision gas chromatograph for volatile organic compound analysis.',
    faqs: [
      { question: 'What carrier gases are supported?', answer: 'Supports Helium, Hydrogen, and Nitrogen.' }
    ]
  })

  // 4. Create Article linked to Product & Category
  console.log('Seeding Article...')
  await sanity.create({
    _type: 'article',
    title: 'Sample Preparation Protocol for Gas Chromatography',
    slug: { current: 'sample-prep-protocol-gc' },
    articleType: 'protocol',
    summary: 'A step-by-step guide to preparing liquid samples prior to GC injection to minimize column contamination.',
    category: { _type: 'reference', _ref: category._id },
    relatedProducts: [{ _type: 'reference', _ref: product._id, _key: 'ref1' }],
    body: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Ensure sample filtration using a 0.22 micron PTFE syringe filter to avoid clogging the column inlet.' }]
      }
    ]
  })

  console.log('✅ Sanity Seeding Complete!')
}

seed().catch(console.error)