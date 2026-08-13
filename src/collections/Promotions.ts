import type { CollectionConfig } from 'payload'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'badge', type: 'text', localized: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'ctaLabel', type: 'text', localized: true },
    { name: 'ctaHref', type: 'text' },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'light',
      options: ['light', 'dark'],
    },
  ],
}
