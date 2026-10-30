import type { Access, CollectionConfig } from 'payload'
import { hiddenForEditors, isAdmin, isAdminUser } from '../access/isAdmin'

// A customer may only see and edit their own record; staff see everyone.
const adminOrSelf: Access = ({ req }) => {
  if (isAdminUser(req)) return true
  if (req.user?.collection === 'customers') return { id: { equals: req.user.id } }
  return false
}

// Clinic accounts from the public site (/account). Kept apart from `users` so a customer
// login can never reach the admin panel. Registration is open — no approval step.
export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Klient', plural: 'Klientët' },
  admin: {
    useAsTitle: 'clinicName',
    group: 'Shitjet',
    hidden: hiddenForEditors,
    defaultColumns: ['clinicName', 'fullName', 'email', 'phone', 'city', 'createdAt'],
    description: 'Klinikat që janë regjistruar vetë në faqe. Porositë e tyre lidhen me llogarinë.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    maxLoginAttempts: 10,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    admin: () => false,
    create: () => true,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'clinicName', type: 'text', required: true, label: 'Klinika' },
        { name: 'fullName', type: 'text', required: true, label: 'Emri dhe mbiemri' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', required: true, label: 'Telefoni' },
        { name: 'city', type: 'text', label: 'Qyteti' },
      ],
    },
    { name: 'address', type: 'textarea', label: 'Adresa e dorëzimit' },
    {
      name: 'licenseNumber',
      type: 'text',
      label: 'Numri i licencës',
      admin: { description: 'Opsionale — e plotëson klinika gjatë regjistrimit.' },
    },
  ],
}
