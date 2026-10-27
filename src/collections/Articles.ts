import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '../access/isAdmin'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Artikull', plural: 'Artikujt' },
  admin: {
    useAsTitle: 'title',
    group: 'Përmbajtja',
    description: 'Artikujt e seksionit mësimor për profesionistët.',
  },
  access: publicReadAdminWrite,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, label: 'Titulli' },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          label: 'Adresa në lidhje (slug)',
          admin: { description: 'Vetëm shkronja të vogla, numra dhe viza.' },
        },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Përmbledhja',
      admin: { description: 'Dy-tri fjali që shfaqen te lista e artikujve.' },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
      localized: true,
      label: 'Teksti i artikullit',
    },
    {
      name: 'tag',
      type: 'select',
      required: true,
      label: 'Lloji',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Udhëzues trajtimi', value: 'Treatment Guide' },
        { label: 'Krahasim', value: 'Comparison' },
        { label: 'Edukim', value: 'Education' },
      ],
    },
    {
      name: 'readTime',
      type: 'text',
      label: 'Koha e leximit',
      admin: { position: 'sidebar', description: 'P.sh. 6 min.' },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto e kopertinës',
      admin: { position: 'sidebar' },
    },
  ],
}
