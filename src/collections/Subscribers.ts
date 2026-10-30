import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

// Newsletter sign-ups from the footer and homepage forms (server action only).
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Abonent', plural: 'Abonentët (newsletter)' },
  admin: {
    useAsTitle: 'email',
    group: 'Shitjet',
    defaultColumns: ['email', 'locale', 'createdAt'],
    description: 'Email-at që janë regjistruar për newsletter nga faqja.',
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, label: 'Email' },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'sq',
      label: 'Gjuha',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Shqip', value: 'sq' },
        { label: 'English', value: 'en' },
      ],
    },
  ],
}
