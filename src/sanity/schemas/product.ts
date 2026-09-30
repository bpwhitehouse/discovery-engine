import { Rule } from 'sanity'

export const productSchema = {
  name: 'product',
  type: 'document',
  title: 'Product',
  fields: [
    { name: 'title', type: 'string', title: 'Product Title' },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'category', type: 'string', title: 'Category' },
    { name: 'manufacturer', type: 'string', title: 'Manufacturer' },
    { name: 'description', type: 'text', title: 'Main Description' },
    { 
      name: 'metaDescription', 
      type: 'text', 
      rows: 2, 
      validation: (Rule: Rule) => Rule.max(160) 
    },
    { name: 'specifications', type: 'array', of: [{ type: 'block' }] },
    {
      name: 'faqs',
      type: 'array',
      title: 'Product FAQs',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'question', type: 'string' },
            { name: 'answer', type: 'text' },
          ],
        },
      ],
    },
  ],
}