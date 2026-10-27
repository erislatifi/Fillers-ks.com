import type { CollectionConfig } from 'payload'
import { publicReadAdminWrite } from '../access/isAdmin'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  labels: { singular: 'Promocion', plural: 'Promocionet' },
  admin: {
    useAsTitle: 'title',
    group: 'Përmbajtja',
    description: 'Ofertat dhe paketat që shfaqen në Ballinë dhe te faqja “Promocione”.',
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
      name: 'badge',
      type: 'text',
      localized: true,
      label: 'Etiketa',
      admin: { description: 'Teksti i shkurtër mbi kartë, p.sh. “-15%” ose “Ofertë e re”.' },
    },
    { name: 'description', type: 'textarea', localized: true, label: 'Përshkrimi' },
    {
      type: 'row',
      fields: [
        { name: 'ctaLabel', type: 'text', localized: true, label: 'Teksti i butonit' },
        {
          name: 'ctaHref',
          type: 'text',
          label: 'Lidhja e butonit',
          admin: { description: 'P.sh. /catalog ose /brands/juvederm.' },
        },
      ],
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'light',
      label: 'Ngjyra e kartës',
      admin: { position: 'sidebar' },
      options: [
        { label: 'E çelët', value: 'light' },
        { label: 'E errët', value: 'dark' },
      ],
    },
  ],
}
