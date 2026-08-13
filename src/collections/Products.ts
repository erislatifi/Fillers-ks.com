import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Catalog',
    defaultColumns: ['name', 'brand', 'category', 'price', 'bestSeller', 'newArrival'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'brand', type: 'relationship', relationTo: 'brands', required: true },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'size', type: 'text' },
    { name: 'price', type: 'number', defaultValue: 0 },
    { name: 'quoteOnly', type: 'checkbox', defaultValue: false },
    { name: 'bestSeller', type: 'checkbox', defaultValue: false },
    { name: 'newArrival', type: 'checkbox', defaultValue: false },
    { name: 'description', type: 'textarea', required: true, localized: true },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
  ],
}
