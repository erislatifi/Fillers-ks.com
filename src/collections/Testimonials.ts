import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Vlerësim', plural: 'Vlerësimet' },
  admin: {
    useAsTitle: 'clinic',
    group: 'Përmbajtja',
    description: 'Fjalët e klinikave partnere që shfaqen në Ballinë.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'clinic', type: 'text', required: true, label: 'Klinika' },
        { name: 'city', type: 'text', required: true, label: 'Qyteti' },
      ],
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      localized: true,
      label: 'Roli i personit',
      admin: { description: 'P.sh. Drejtor mjekësor, Dermatologe.' },
    },
    { name: 'quote', type: 'textarea', required: true, localized: true, label: 'Citati' },
  ],
}
