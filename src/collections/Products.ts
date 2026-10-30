import type { CollectionConfig } from 'payload'
import { isStaffUser, publicReadAdminWrite } from '../access/isAdmin'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produkt', plural: 'Produktet' },
  admin: {
    useAsTitle: 'name',
    group: 'Katalogu',
    defaultColumns: ['name', 'brand', 'price', 'stockStatus', 'visible', 'bestSeller'],
    description: 'Çdo produkt që shfaqet në katalog, në faqen e brendit dhe në kërkim.',
  },
  access: {
    ...publicReadAdminWrite,
    // Hidden products stay out of the public REST API; staff still see them.
    read: ({ req }) => (isStaffUser(req) ? true : { visible: { not_equals: false } }),
  },
  fields: [
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      label: 'I dukshëm në faqe',
      admin: { position: 'sidebar', description: 'Hiqe tikun për ta fshehur pa e fshirë.' },
    },
    { name: 'name', type: 'text', required: true, label: 'Emri i produktit' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Adresa në lidhje (slug)',
      admin: {
        description: 'Pjesa e lidhjes, p.sh. juvederm-voluma. Vetëm shkronja të vogla, numra dhe viza — pa hapësira.',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'brand', type: 'relationship', relationTo: 'brands', required: true, label: 'Brendi' },
        { name: 'category', type: 'relationship', relationTo: 'categories', required: true, label: 'Kategoria' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'size',
          type: 'text',
          label: 'Madhësia / doza',
          admin: { description: 'P.sh. 1 ml, 2 × 1.1 ml, 50 gjilpëra.' },
        },
        {
          name: 'price',
          type: 'number',
          defaultValue: 0,
          label: 'Çmimi (€)',
          admin: { description: 'Lëre 0 nëse produkti shitet vetëm me ofertë.' },
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          min: 0,
          label: 'Çmimi i vjetër (€)',
          admin: { description: 'Për zbritje: shfaqet i vizatuar mbi çmimin e ri. Bosh = pa zbritje.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'sku', type: 'text', label: 'Kodi (SKU)', admin: { description: 'Kodi i brendshëm ose i prodhuesit.' } },
        {
          name: 'stockStatus',
          type: 'select',
          defaultValue: 'in_stock',
          label: 'Stoku',
          options: [
            { label: 'Në stok', value: 'in_stock' },
            { label: 'Pak në stok', value: 'low_stock' },
            { label: 'Pa stok', value: 'out_of_stock' },
            { label: 'Me porosi (vjen së shpejti)', value: 'preorder' },
          ],
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Përshkrimi',
      admin: { description: 'Shkruaje veç për shqip dhe veç për anglisht (ndërro gjuhën lart djathtas).' },
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Fotot e produktit',
      admin: { description: 'Foto e parë është ajo kryesore. Ngarko foto të qarta, me sfond të pastër.' },
    },
    {
      name: 'quoteOnly',
      type: 'checkbox',
      defaultValue: false,
      label: 'Vetëm me ofertë (pa çmim publik)',
      admin: { position: 'sidebar', description: 'Në vend të çmimit, klientët shohin “Kërko ofertë”.' },
    },
    {
      name: 'bestSeller',
      type: 'checkbox',
      defaultValue: false,
      label: 'Më i shituri',
      admin: { position: 'sidebar', description: 'Shfaqet në seksionin “Më të shiturat” të Ballinës.' },
    },
    {
      name: 'newArrival',
      type: 'checkbox',
      defaultValue: false,
      label: 'Produkt i ri',
      admin: { position: 'sidebar', description: 'Shfaqet në seksionin “Të rejat” të Ballinës.' },
    },
  ],
}
