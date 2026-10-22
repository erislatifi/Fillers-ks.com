import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Brend', plural: 'Brendet' },
  admin: {
    useAsTitle: 'name',
    group: 'Katalogu',
    description: 'Brendet që shpërndan — shfaqen në Ballinë, në faqen e brendeve dhe në filtrat e katalogut.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Emri i brendit' },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          label: 'Adresa në lidhje (slug)',
          admin: { description: 'P.sh. juvederm. Vetëm shkronja të vogla, numra dhe viza.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'origin',
          type: 'text',
          required: true,
          label: 'Shteti i origjinës',
          admin: { description: 'P.sh. ITALY, SOUTH KOREA, FRANCE.' },
        },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'injectable',
          label: 'Lloji',
          options: [
            { label: 'Injektues', value: 'injectable' },
            { label: 'Pajisje', value: 'device' },
          ],
        },
      ],
    },
    {
      name: 'tagline',
      type: 'text',
      required: true,
      localized: true,
      label: 'Slogani (një rresht)',
      admin: { description: 'Shfaqet nën emrin e brendit në kartë.' },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Përshkrimi',
    },
    {
      name: 'distribution',
      type: 'text',
      localized: true,
      label: 'Shënim distribuimi',
      admin: { description: 'P.sh. “Distributor zyrtar për Kosovë dhe Shqipëri”. Lëre bosh nëse nuk vlen.' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Kategoria kryesore',
      admin: { position: 'sidebar' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logoja',
      admin: { position: 'sidebar', description: 'Mundësisht PNG me sfond transparent.' },
    },
  ],
}
