import type { AccessResult, CollectionConfig } from 'payload'
import { hiddenForNonSales, isAdmin, isAdminUser, isAgentUser } from '../access/isAdmin'

// Clinic visits by sales agents, planned and recorded from the tablet app (/agjent).
// The tablet writes through /agjent/api/sync (server side); in the admin, agents only read theirs.
export const Visits: CollectionConfig = {
  slug: 'visits',
  labels: { singular: 'Vizitë', plural: 'Vizitat' },
  admin: {
    useAsTitle: 'clinicName',
    group: 'Shitjet',
    hidden: hiddenForNonSales,
    defaultColumns: ['clinicName', 'agent', 'scheduledAt', 'status', 'interest', 'nextVisitAt'],
    description: 'Vizitat e agjentëve te klinikat — të planifikuara dhe të kryera nga tableti (/agjent).',
  },
  access: {
    read: ({ req }): AccessResult => {
      if (isAdminUser(req)) return true
      if (isAgentUser(req)) return { agent: { equals: req.user!.id } }
      return false
    },
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'clinicName', type: 'text', required: true, label: 'Klinika' },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'planned',
          label: 'Statusi',
          options: [
            { label: 'E planifikuar', value: 'planned' },
            { label: 'Në vazhdim', value: 'in_progress' },
            { label: 'E kryer', value: 'done' },
            { label: 'E anuluar', value: 'cancelled' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'agent', type: 'relationship', relationTo: 'users', required: true, label: 'Agjenti', filterOptions: { roles: { in: ['agent'] } } },
        { name: 'customer', type: 'relationship', relationTo: 'customers', label: 'Klinika (llogaria)' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'scheduledAt', type: 'date', label: 'Termini', admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15 } } },
        { name: 'checkInAt', type: 'date', label: 'Filloi', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'checkOutAt', type: 'date', label: 'Përfundoi', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'interest',
          type: 'select',
          label: 'Interesimi',
          options: [
            { label: 'I ulët', value: 'low' },
            { label: 'Mesatar', value: 'medium' },
            { label: 'I lartë', value: 'high' },
          ],
        },
        { name: 'nextVisitAt', type: 'date', label: 'Vizita e ardhshme', admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15 } } },
      ],
    },
    { name: 'notes', type: 'textarea', label: 'Shënime nga vizita' },
    {
      type: 'row',
      fields: [
        { name: 'checkInLat', type: 'number', label: 'Gjerësia (GPS)', admin: { readOnly: true } },
        { name: 'checkInLng', type: 'number', label: 'Gjatësia (GPS)', admin: { readOnly: true } },
      ],
    },
    {
      name: 'orders',
      type: 'join',
      collection: 'orders',
      on: 'visit',
      label: 'Porositë nga kjo vizitë',
    },
    {
      // Set by the tablet so a visit synced twice (offline retries) is stored once.
      name: 'clientId',
      type: 'text',
      unique: true,
      index: true,
      admin: { hidden: true },
    },
  ],
}
