import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

// Messages from the public contact form. Created only by the server action (Local API),
// so REST create stays admin-only and can't be used to spam the inbox.
export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: { singular: 'Mesazh', plural: 'Mesazhet' },
  admin: {
    useAsTitle: 'name',
    group: 'Shitjet',
    defaultColumns: ['name', 'clinicName', 'email', 'status', 'createdAt'],
    description: 'Mesazhet nga forma e kontaktit në faqe. Ndrysho statusin kur t’i përgjigjesh.',
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      label: 'Statusi',
      admin: { position: 'sidebar' },
      options: [
        { label: 'I ri', value: 'new' },
        { label: 'I lexuar', value: 'read' },
        { label: 'U përgjigj', value: 'replied' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Emri' },
        { name: 'clinicName', type: 'text', label: 'Klinika' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', required: true, label: 'Email' },
        { name: 'phone', type: 'text', label: 'Telefoni' },
      ],
    },
    { name: 'message', type: 'textarea', required: true, label: 'Mesazhi', admin: { rows: 8 } },
  ],
}
