import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

// Layout + labels only: field names/shape are unchanged, so no migration is needed.
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Cilësimet e faqes',
  admin: {
    group: 'Administrimi',
    description: 'Të dhënat e kontaktit, bankës, rrjeteve sociale dhe SEO që përdoren në të gjithë faqen.',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Kontakti',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'contactPhone', type: 'text', label: 'Telefoni' },
                { name: 'contactEmail', type: 'text', label: 'Email' },
              ],
            },
            { name: 'address', type: 'text', localized: true, label: 'Adresa' },
            {
              name: 'businessRegistrationNumber',
              type: 'text',
              label: 'NUIS (numri i regjistrimit të biznesit)',
              admin: { description: 'Shfaqet në fund të faqes dhe te checkout si sinjal besimi.' },
            },
          ],
        },
        {
          label: 'Banka',
          description: 'Shfaqen klientëve që zgjedhin “Transfer bankar” në checkout.',
          fields: [
            {
              type: 'group',
              name: 'bankDetails',
              label: false,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'bankName', type: 'text', label: 'Emri i bankës' },
                    { name: 'accountHolder', type: 'text', label: 'Pronari i llogarisë' },
                  ],
                },
                { name: 'iban', type: 'text', label: 'IBAN / Numri i llogarisë' },
                { name: 'swift', type: 'text', label: 'SWIFT/BIC (opsionale)' },
              ],
            },
          ],
        },
        {
          label: 'Rrjetet sociale',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              label: 'Lidhjet',
              labels: { singular: 'Lidhje', plural: 'Lidhjet' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      label: 'Platforma',
                      options: [
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'Facebook', value: 'facebook' },
                        { label: 'LinkedIn', value: 'linkedin' },
                      ],
                    },
                    { name: 'url', type: 'text', label: 'Adresa (URL)' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          description: 'Si shfaqet faqja në Google kur nuk ka titull tjetër.',
          fields: [
            { name: 'seoDefaultTitle', type: 'text', localized: true, label: 'Titulli i parazgjedhur' },
            { name: 'seoDefaultDescription', type: 'textarea', localized: true, label: 'Përshkrimi i parazgjedhur' },
          ],
        },
      ],
    },
  ],
}
