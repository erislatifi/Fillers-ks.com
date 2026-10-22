import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Foto', plural: 'Fotot' },
  admin: {
    group: 'Media',
    description: 'Biblioteka e fotove — ngarko këtu një herë, pastaj zgjidhi te produktet, brendet dhe artikujt.',
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
      label: 'Përshkrimi i fotos',
      admin: { description: 'Shkruaj shkurt çfarë shihet në foto — ndihmon Google-in dhe përdoruesit me lexues ekrani.' },
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
