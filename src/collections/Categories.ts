import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Catalog',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'text', localized: true },
    {
      name: 'icon',
      type: 'select',
      required: true,
      options: [
        'drop',
        'sparkle',
        'hair',
        'cell',
        'cannula',
        'needle',
        'meso',
        'shield',
        'laser',
      ],
    },
  ],
}
