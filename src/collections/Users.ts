import type { Access, CollectionConfig } from 'payload'
import { hiddenForEditors, isAdmin, isAdminUser, isStaffUser } from '../access/isAdmin'

// Admins manage everyone; an editor can only see and update their own account.
const adminOrSelf: Access = ({ req }) =>
  isAdminUser(req) ? true : isStaffUser(req) ? { id: { equals: req.user!.id } } : false

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Përdorues', plural: 'Përdoruesit' },
  admin: {
    useAsTitle: 'email',
    group: 'Administrimi',
    hidden: hiddenForEditors,
    description: 'Njerëzit që kanë qasje në këtë panel.',
  },
  auth: true,
  // Staff accounts — a logged-in customer must not list or edit these.
  access: {
    admin: ({ req }) => isStaffUser(req),
    read: adminOrSelf,
    create: isAdmin,
    update: adminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['admin'],
      label: 'Rolet',
      // Only an admin can change roles — an editor must not be able to promote themselves.
      access: { create: ({ req }) => isAdminUser(req), update: ({ req }) => isAdminUser(req) },
      admin: {
        description:
          'Administrator: gjithçka. Redaktor: produktet, brendet, faqet, ballina dhe përmbajtja — pa porositë, klientët, mesazhet dhe cilësimet.',
      },
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Redaktor', value: 'editor' },
      ],
    },
  ],
}
