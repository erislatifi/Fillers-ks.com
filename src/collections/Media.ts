import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Media',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
    },
  ],
  upload: {
    staticDir: '../public/media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 800, height: 1000, position: 'centre' },
      { name: 'hero', width: 1600, height: 2000, position: 'centre' },
    ],
    mimeTypes: ['image/*'],
  },
}
