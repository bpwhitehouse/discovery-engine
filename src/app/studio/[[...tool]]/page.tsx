'use client'

import { NextStudio } from 'next-sanity/studio'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { productSchema } from '@/sanity/schemas/product'
import { categorySchema } from '@/sanity/schemas/category'
import { manufacturerSchema } from '@/sanity/schemas/manufacturer'
import { articleSchema } from '@/sanity/schemas/article'

const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'tn8roucm',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  title: 'Discovery Engine Studio',
  basePath: '/studio',
  plugins: [structureTool()],
  schema: {
    types: [productSchema, categorySchema, manufacturerSchema, articleSchema],
  },
})

export default function StudioPage() {
  return <NextStudio config={config} />
}
