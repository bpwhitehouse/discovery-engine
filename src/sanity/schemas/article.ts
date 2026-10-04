export const articleSchema = {
  name: 'article',
  type: 'document',
  title: 'Article / Whitepaper',
  fields: [
    { name: 'title', type: 'string', title: 'Article Title' },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { 
      name: 'articleType', 
      type: 'string', 
      title: 'Article Type',
      options: {
        list: [
          { title: 'Protocol / Lab Guide', value: 'protocol' },
          { title: 'Whitepaper', value: 'whitepaper' },
          { title: 'Application Note', value: 'application_note' },
        ],
      },
    },
    { name: 'summary', type: 'text', title: 'Summary', rows: 3 },
    { name: 'body', type: 'array', title: 'Body Content', of: [{ type: 'block' }] },
    {
      name: 'category',
      type: 'reference',
      title: 'Category',
      to: [{ type: 'category' }],
    },
    {
      name: 'relatedProducts',
      type: 'array',
      title: 'Related Products / Equipment',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
    },
  ],
}