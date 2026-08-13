import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'clinic',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'clinic', type: 'text', required: true },
    { name: 'city', type: 'text', required: true },
    { name: 'role', type: 'text', required: true, localized: true },
    { name: 'quote', type: 'textarea', required: true, localized: true },
  ],
}
