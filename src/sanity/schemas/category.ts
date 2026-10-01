export const categorySchema = {
  name: 'category',
  type: 'document',
  title: 'Category',
  fields: [
    { name: 'title', type: 'string', title: 'Category Title' },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'description', type: 'text', title: 'Description' },
  ],
}