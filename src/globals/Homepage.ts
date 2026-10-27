import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

// Layout + labels only: the data shape (hero.*, about.*) is unchanged, so no migration is needed.
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Ballina',
  admin: {
    group: 'Administrimi',
    description: 'Tekstet kryesore të faqes ballore. Ndryshimet shfaqen në faqe sapo i ruan.',
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
      ],
    },
  ],
}
