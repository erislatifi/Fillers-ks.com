import type { Access, CollectionConfig, FieldAccess } from 'payload'
import { hiddenForEditors, isAdmin, isAdminUser, isPanelUser } from '../access/isAdmin'

// Admins manage everyone; editors and agents can only see and update their own account.
const adminOrSelf: Access = ({ req }) =>
  isAdminUser(req) ? true : isPanelUser(req) ? { id: { equals: req.user!.id } } : false

// Only an admin may set roles, commission rates and referral codes — nobody promotes
// themselves or raises their own commission.
const adminOnlyWrite: { create: FieldAccess; update: FieldAccess } = {
  create: ({ req }) => isAdminUser(req),
  update: ({ req }) => isAdminUser(req),
}

const isAgent = (data: { roles?: string[] | null } | undefined) => Boolean(data?.roles?.includes('agent'))

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Përdorues', plural: 'Përdoruesit' },
  admin: {
    useAsTitle: 'email',
    group: 'Administrimi',
    hidden: hiddenForEditors,
    defaultColumns: ['email', 'fullName', 'roles', 'agentCode', 'defaultCommissionRate'],
    description: 'Njerëzit që kanë qasje në këtë panel: administratorët, redaktorët dhe agjentët e shitjes.',
  },
  // 7 days: agents work offline on tablets all day; a 2-hour session would stop their sync.
  auth: { tokenExpiration: 60 * 60 * 24 * 7 },
  // Staff accounts — a logged-in customer must not list or edit these.
  access: {
    admin: ({ req }) => isPanelUser(req),
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
      access: adminOnlyWrite,
      admin: {
        description:
          'Administrator: gjithçka. Redaktor: produktet, brendet, faqet, ballina dhe përmbajtja — pa shitjet. Agjent shitjeje: vetëm porositë, klinikat dhe komisioni i vet.',
      },
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Redaktor', value: 'editor' },
        { label: 'Agjent shitjeje', value: 'agent' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'fullName', type: 'text', label: 'Emri dhe mbiemri' },
        { name: 'phone', type: 'text', label: 'Telefoni' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Agjenti i shitjes',
      admin: { condition: (data) => isAgent(data) },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'agentCode',
              type: 'text',
              unique: true,
              label: 'Kodi i agjentit',
              access: adminOnlyWrite,
              hooks: {
                // "arben 1" → "ARBEN1", so links match regardless of how the code was typed.
                beforeValidate: [
                  ({ value }) =>
                    typeof value === 'string' ? value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') || null : value,
                ],
              },
              admin: {
                description:
                  'Vetëm shkronja/numra, p.sh. ARBEN. Lidhja personale: shop-fillers-ks.com/sq?ref=ARBEN — kush porosit pas saj i shkon këtij agjenti.',
              },
            },
            {
              name: 'defaultCommissionRate',
              type: 'number',
              min: 0,
              max: 100,
              label: 'Komisioni standard (%)',
              access: adminOnlyWrite,
              admin: { description: 'Vlen për produktet që s’kanë përqindjen e tyre.' },
            },
            {
              name: 'maxDiscountPercent',
              type: 'number',
              min: 0,
              max: 100,
              defaultValue: 0,
              label: 'Zbritja maksimale në tablet (%)',
              access: adminOnlyWrite,
              admin: { description: 'Sa zbritje guxon me dhënë agjenti në një porosi nga tableti. 0 = asnjë.' },
            },
          ],
        },
      ],
    },
  ],
}
