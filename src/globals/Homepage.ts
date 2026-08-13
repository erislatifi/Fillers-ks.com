import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'group',
      name: 'hero',
      fields: [
        { name: 'eyebrow', type: 'text', localized: true },
        { name: 'title', type: 'text', localized: true },
        { name: 'subtitle', type: 'textarea', localized: true },
        { name: 'primaryCtaLabel', type: 'text', localized: true },
        { name: 'primaryCtaHref', type: 'text' },
        { name: 'secondaryCtaLabel', type: 'text', localized: true },
        { name: 'secondaryCtaHref', type: 'text' },
        { name: 'statsProducts', type: 'text' },
        { name: 'statsBrands', type: 'text' },
        { name: 'statsClinics', type: 'text' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      type: 'group',
      name: 'about',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'paragraph1', type: 'textarea', localized: true },
        { name: 'paragraph2', type: 'textarea', localized: true },
        { name: 'quote', type: 'text', localized: true },
        { name: 'distributionNote', type: 'text', localized: true },
      ],
    },
  ],
}
