import type { AccessResult, CollectionConfig } from 'payload'
import { hiddenForNonSales, isAdmin, isAdminUser, isAgentUser } from '../access/isAdmin'

// GPS points from the agents' tablets: every 15 minutes while the app is open, plus at the
// start and end of each visit. Written by /agjent/api/sync; read-only in the admin.
export const AgentLocations: CollectionConfig = {
  slug: 'agent-locations',
  labels: { singular: 'Lokacion', plural: 'Lokacionet e agjentëve' },
  admin: {
    useAsTitle: 'recordedAt',
    group: 'Agjentët',
    hidden: hiddenForNonSales,
    defaultColumns: ['agent', 'recordedAt', 'kind', 'mapLink'],
    description: 'Ku kanë qenë agjentët (GPS nga tableti, çdo 15 minuta kur aplikacioni është i hapur).',
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
  defaultSort: '-recordedAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'agent', type: 'relationship', relationTo: 'users', required: true, label: 'Agjenti' },
        { name: 'recordedAt', type: 'date', required: true, label: 'Koha', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        {
          name: 'kind',
          type: 'select',
          defaultValue: 'interval',
          label: 'Lloji',
          options: [
            { label: 'Çdo 15 min', value: 'interval' },
            { label: 'Fillimi i vizitës', value: 'check_in' },
            { label: 'Fundi i vizitës', value: 'check_out' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'lat', type: 'number', required: true, label: 'Gjerësia' },
        { name: 'lng', type: 'number', required: true, label: 'Gjatësia' },
        { name: 'accuracy', type: 'number', label: 'Saktësia (m)' },
      ],
    },
    { name: 'visit', type: 'relationship', relationTo: 'visits', label: 'Vizita' },
    {
      // Clickable "Shiko në hartë" in the list and the document.
      name: 'mapLink',
      type: 'ui',
      label: 'Harta',
      admin: { components: { Field: './components/admin/MapLink#MapLink', Cell: './components/admin/MapLink#MapLinkCell' } },
    },
    { name: 'clientId', type: 'text', unique: true, index: true, admin: { hidden: true } },
  ],
}
