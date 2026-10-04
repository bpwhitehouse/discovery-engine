export const manufacturerSchema = {
  name: 'manufacturer',
  type: 'document',
  title: 'Manufacturer',
  fields: [
    { name: 'name', type: 'string', title: 'Manufacturer Name' },
    { name: 'slug', type: 'slug', options: { source: 'name' } },
    { name: 'website', type: 'url', title: 'Website' },
    { name: 'description', type: 'text', title: 'Description' },
  ],
}