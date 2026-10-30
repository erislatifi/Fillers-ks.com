import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

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
              type: 'row',
              fields: [
                {
                  name: 'whatsapp',
                  type: 'text',
                  label: 'WhatsApp',
                  admin: { description: 'Numri me prefiks, p.sh. +383 44 123 456. Bosh = s’shfaqet.' },
                },
                {
                  name: 'businessRegistrationNumber',
                  type: 'text',
                  label: 'NUIS (numri i regjistrimit të biznesit)',
                  admin: { description: 'Shfaqet në fund të faqes dhe te checkout si sinjal besimi.' },
                },
              ],
            },
            {
              name: 'openingHours',
              type: 'textarea',
              localized: true,
              label: 'Orari i punës',
              admin: { description: 'Një rresht për çdo ditë/periudhë, p.sh. "Hën–Pre: 09:00–17:00".' },
            },
            {
              name: 'showMap',
              type: 'checkbox',
              defaultValue: true,
              label: 'Shfaq hartën (Google Maps) te faqja e kontaktit',
              admin: { description: 'Harta gjendet automatikisht nga adresa më lart.' },
            },
          ],
        },
        {
          label: 'Dërgesa dhe porositë',
          description: 'Kostoja e korrierit, njoftimet për porosi dhe të dhënat që dalin në faturë.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'courierFee',
                  type: 'number',
                  min: 0,
                  label: 'Kostoja e dërgesës me korrier (€)',
                  admin: { description: 'Bosh ose 0 = "konfirmohet nga ekipi".' },
                },
                {
                  name: 'freeShippingThreshold',
                  type: 'number',
                  min: 0,
                  label: 'Dërgesë falas mbi (€)',
                  admin: { description: 'Bosh = asnjëherë falas.' },
                },
              ],
            },
            {
              name: 'orderNotificationEmail',
              type: 'email',
              label: 'Email-i ku vijnë njoftimet për porosi dhe mesazhe',
              admin: {
                description: 'Kërkon që email-i (SMTP) të jetë konfiguruar te Hostinger. Bosh = email-i i kontaktit.',
              },
            },
            {
              name: 'legalName',
              type: 'text',
              label: 'Emri ligjor i biznesit (në faturë)',
              admin: { description: 'P.sh. Alp Estetik SHPK.' },
            },
          ],
        },
        {
          label: 'Tekstet e faqes',
          description: 'Tekstet që shfaqen në çdo faqe. Lëri bosh për të përdorur tekstin standard.',
          fields: [
            {
              name: 'announcement',
              type: 'group',
              label: 'Shiriti i njoftimeve (lart në faqe)',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: false, label: 'Shfaqe shiritin' },
                {
                  name: 'text',
                  type: 'text',
                  localized: true,
                  label: 'Teksti',
                  admin: { description: 'P.sh. "Dërgesë falas për porosi mbi 200€".' },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'linkLabel', type: 'text', localized: true, label: 'Teksti i lidhjes (opsionale)' },
                    { name: 'linkHref', type: 'text', label: 'Lidhja', admin: { description: 'P.sh. /promotions' } },
                  ],
                },
              ],
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: 'Slogani nën logo',
              admin: { description: 'Standard: "Ndriço me ne!"' },
            },
            {
              name: 'topBarNotice',
              type: 'text',
              localized: true,
              label: 'Teksti në shiritin e zi lart',
              admin: { description: 'Standard: "Vetëm për profesionistë të licencuar…"' },
            },
            { name: 'footerDescription', type: 'textarea', localized: true, label: 'Përshkrimi në footer (nën logo)' },
            {
              name: 'professionalNotice',
              type: 'textarea',
              localized: true,
              label: 'Njoftimi profesional në footer',
              admin: { description: 'Kutia me mburojë në fund të çdo faqeje.' },
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
