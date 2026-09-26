import { createClient } from '@sanity/client'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
})

const sampleProducts = [
  {
    title: 'Mass Spectrometer X1',
    category: 'Analytical Equipment',
    manufacturer: 'LabCorp',
    metaDescription: 'High-precision mass spectrometer designed for advanced chemical composition analysis.',
    description: 'The Mass Spectrometer X1 delivers high-sensitivity performance for qualitative and quantitative mass spectral analysis.',
    faqs: [
      { question: 'What is the target application?', answer: 'Chemical research, pharmaceutical testing, and proteomics.' },
      { question: 'Does it support continuous sampling?', answer: 'Yes, it features an automated inline sample intake module.' }
    ]
  },
  {
    title: 'Electron Microscope Pro',
    category: 'Microscopy',
    manufacturer: 'NanoView',
    metaDescription: 'Ultra-high-resolution transmission electron microscope for nanoscale imaging.',
    description: 'Provides atomic-scale resolution for detailed examination of biological specimens, polymers, and materials.',
    faqs: [
      { question: 'What is the maximum magnification?', answer: 'Up to 1,000,000x magnification.' },
      { question: 'Is cryogenic cooling supported?', answer: 'Yes, optional cryo-stage attachments are available.' }
    ]
  },
  {
    title: 'HPLC Chromatography Column',
    category: 'Chromatography',
    manufacturer: 'Separations Inc',
    metaDescription: 'High-performance liquid chromatography column engineered for superior peak resolution.',
    description: 'Designed for demanding separations in analytical chemistry, ensuring reproducible and precise chromatograms.',
    faqs: [
      { question: 'What column packing material is used?', answer: 'Ultra-pure silica particles with C18 bonding.' },
      { question: 'What is the maximum operating pressure?', answer: 'Rated for up to 600 bar.' }
    ]
  }
]

async function seedProducts() {
  for (const item of sampleProducts) {
    await sanity.create({
      _type: 'product',
      title: item.title,
      slug: { current: item.title.toLowerCase().replace(/ /g, '-') },
      category: item.category,
      manufacturer: item.manufacturer,
      description: item.description,
      metaDescription: item.metaDescription,
      faqs: item.faqs,
    })
    console.log(`Created product: ${item.title}`)
  }
}

seedProducts()