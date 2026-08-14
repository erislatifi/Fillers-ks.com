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
    { name: 'businessRegistrationNumber', type: 'text', label: 'Business Registration No. (NUIS)' },
    {
      name: 'bankDetails',
      type: 'group',
      label: 'Bank Transfer Details',
      fields: [
        { name: 'bankName', type: 'text' },
        { name: 'accountHolder', type: 'text' },
        { name: 'iban', type: 'text', label: 'IBAN / Account Number' },
        { name: 'swift', type: 'text', label: 'SWIFT/BIC (optional)' },
      ],
    },
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
