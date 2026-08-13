import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    { name: 'contactPhone', type: 'text' },
    { name: 'contactEmail', type: 'text' },
    { name: 'address', type: 'text', localized: true },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: ['instagram', 'facebook', 'linkedin'],
        },
        { name: 'url', type: 'text' },
      ],
    },
    { name: 'seoDefaultTitle', type: 'text', localized: true },
    { name: 'seoDefaultDescription', type: 'textarea', localized: true },
  ],
}
