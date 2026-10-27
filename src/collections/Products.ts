import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '../access/isAdmin'

// NOTE: only labels / layout / descriptions are customised below — field names, types and
// `required` flags are untouched, so the database schema (and production Postgres) is unchanged.
export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produkt', plural: 'Produktet' },
  admin: {
    useAsTitle: 'name',
    group: 'Katalogu',
    defaultColumns: ['name', 'brand', 'category', 'price', 'bestSeller', 'newArrival'],
    description: 'Çdo produkt që shfaqet në katalog, në faqen e brendit dhe në kërkim.',
  },
  access: publicReadAdminWrite,
  fields: [
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
