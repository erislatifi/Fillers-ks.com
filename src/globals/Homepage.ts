import type { GlobalConfig } from 'payload'
import { isStaff } from '../access/isAdmin'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Ballina',
  admin: {
    group: 'Administrimi',
    description: 'Tekstet kryesore të faqes ballore. Ndryshimet shfaqen në faqe sapo i ruan.',
  },
  access: {
    read: () => true,
    update: isStaff,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Seksioni kryesor',
          description: 'Pjesa e parë që shohin vizitorët kur hapin faqen.',
          fields: [
            {
              type: 'group',
              name: 'hero',
              label: false,
              fields: [
                {
                  name: 'eyebrow',
                  type: 'text',
                  localized: true,
                  label: 'Teksti i vogël mbi titull',
                  admin: { description: 'P.sh. “Distributori i Certifikuar …”.' },
                },
                { name: 'title', type: 'text', localized: true, label: 'Titulli kryesor' },
                { name: 'subtitle', type: 'textarea', localized: true, label: 'Nëntitulli' },
                {
                  type: 'row',
                  fields: [
                    { name: 'primaryCtaLabel', type: 'text', localized: true, label: 'Butoni i parë — teksti' },
                    {
                      name: 'primaryCtaHref',
                      type: 'text',
                      label: 'Butoni i parë — lidhja',
                      admin: { description: 'P.sh. /catalog' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'secondaryCtaLabel', type: 'text', localized: true, label: 'Butoni i dytë — teksti' },
                    {
                      name: 'secondaryCtaHref',
                      type: 'text',
                      label: 'Butoni i dytë — lidhja',
                      admin: { description: 'P.sh. /account/register' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'statsProducts', type: 'text', label: 'Numri i produkteve', admin: { description: 'P.sh. 100+' } },
                    { name: 'statsBrands', type: 'text', label: 'Numri i brendeve', admin: { description: 'P.sh. 14' } },
                    { name: 'statsClinics', type: 'text', label: 'Numri i klinikave', admin: { description: 'P.sh. 500+' } },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Foto kryesore',
                  admin: { description: 'Foto e madhe e seksionit të parë.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Rreth nesh',
          description: 'Seksioni që prezanton kompaninë.',
          fields: [
            {
              type: 'group',
              name: 'about',
              label: false,
              fields: [
                { name: 'title', type: 'text', localized: true, label: 'Titulli' },
                { name: 'paragraph1', type: 'textarea', localized: true, label: 'Paragrafi 1' },
                { name: 'paragraph2', type: 'textarea', localized: true, label: 'Paragrafi 2' },
                { name: 'quote', type: 'text', localized: true, label: 'Thënia / citati' },
                {
                  name: 'distributionNote',
                  type: 'text',
                  localized: true,
                  label: 'Shënim për distribuimin',
                  admin: { description: 'P.sh. për Jeisys dhe Clarius — Kosovë dhe Shqipëri.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Seksionet',
          description:
            'Renditja e seksioneve pas pjesës kryesore. Zvarrit për t’i rirenditur, hiq tikun për t’i fshehur. Titujt bosh = teksti standard.',
          fields: [
            {
              name: 'sections',
              type: 'array',
              label: 'Seksionet e ballinës',
              labels: { singular: 'Seksion', plural: 'Seksionet' },
              admin: {
                initCollapsed: true,
                components: { RowLabel: './components/admin/SectionRowLabel#SectionRowLabel' },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'section',
                      type: 'select',
                      required: true,
                      label: 'Seksioni',
                      options: [
                        { label: 'Brendet', value: 'brands' },
                        { label: 'Rreth nesh', value: 'about' },
                        { label: 'Pajisjet (Jeisys, Clarius…)', value: 'devices' },
                        { label: 'Më të shiturat', value: 'bestSellers' },
                        { label: 'Kategoritë', value: 'categories' },
                        { label: 'Pse ne', value: 'why' },
                        { label: 'Të rejat', value: 'newArrivals' },
                        { label: 'Qendra edukative', value: 'education' },
                        { label: 'Promocionet', value: 'promotions' },
                        { label: 'Vlerësimet e klinikave', value: 'testimonials' },
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'Newsletter', value: 'newsletter' },
                      ],
                    },
                    { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Shfaqe' },
                  ],
                },
                { name: 'eyebrow', type: 'text', localized: true, label: 'Teksti i vogël mbi titull' },
                { name: 'title', type: 'text', localized: true, label: 'Titulli' },
                { name: 'description', type: 'textarea', localized: true, label: 'Përshkrimi' },
              ],
            },
          ],
        },
        {
          label: 'Pse ne',
          description: 'Kartat e seksionit "Pse ne". Bosh = 5 kartat standarde.',
          fields: [
            {
              name: 'whyItems',
              type: 'array',
              label: 'Kartat',
              labels: { singular: 'Kartë', plural: 'Kartat' },
              maxRows: 8,
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  defaultValue: 'original',
                  label: 'Ikona',
                  options: [
                    { label: 'Origjinale (shenjë)', value: 'original' },
                    { label: 'Certifikuar (mburojë)', value: 'certified' },
                    { label: 'Dërgesë (kamion)', value: 'delivery' },
                    { label: 'Mbështetje (kufje)', value: 'support' },
                    { label: 'E besuar (medalje)', value: 'trusted' },
                  ],
                },
                { name: 'title', type: 'text', required: true, localized: true, label: 'Titulli' },
                { name: 'description', type: 'textarea', localized: true, label: 'Përshkrimi' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
