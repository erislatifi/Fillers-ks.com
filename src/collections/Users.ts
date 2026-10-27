import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminUser } from '../access/isAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Përdorues', plural: 'Përdoruesit' },
  admin: {
    useAsTitle: 'email',
    group: 'Administrimi',
    description: 'Njerëzit që kanë qasje në këtë panel.',
  },
  auth: true,
  // Staff accounts — a logged-in customer must not list or edit these.
  access: {
    admin: ({ req }) => isAdminUser(req),
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['admin'],
      label: 'Rolet',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Redaktor', value: 'editor' },
      ],
    },
  ],
}
