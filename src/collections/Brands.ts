import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    group: 'Catalog',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'origin', type: 'text', required: true },
    { name: 'tagline', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'injectable',
      options: ['injectable', 'device'],
    },
    { name: 'distribution', type: 'text', localized: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
  ],
}
