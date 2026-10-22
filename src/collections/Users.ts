import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Përdorues', plural: 'Përdoruesit' },
  admin: {
    useAsTitle: 'email',
    group: 'Administrimi',
    description: 'Njerëzit që kanë qasje në këtë panel.',
  },
  auth: true,
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
