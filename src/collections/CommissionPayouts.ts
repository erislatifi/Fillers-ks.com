import type { AccessResult, CollectionConfig } from 'payload'
import { hiddenForNonSales, isAdmin, isAdminUser, isAgentUser } from '../access/isAdmin'

// Record of commission paid to an agent for a month; the commission report shows each
// month as paid / unpaid from these.
export const CommissionPayouts: CollectionConfig = {
  slug: 'commission-payouts',
  labels: { singular: 'Pagesë komisioni', plural: 'Pagesat e komisionit' },
  admin: {
    useAsTitle: 'month',
    group: 'Shitjet',
    hidden: hiddenForNonSales,
    defaultColumns: ['agent', 'month', 'amount', 'paidAt'],
    description: 'Kur ia paguan komisionin një agjenti për një muaj, shënoje këtu — raporti e tregon muajin si të paguar.',
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
        {
          name: 'agent',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          label: 'Agjenti',
          filterOptions: { roles: { in: ['agent'] } },
        },
        {
          name: 'month',
          type: 'text',
          required: true,
          label: 'Muaji',
          admin: { description: 'Formati VVVV-MM, p.sh. 2026-11.' },
          validate: (value: string | null | undefined) =>
            /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? '') || 'Shkruaje si VVVV-MM, p.sh. 2026-11',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'amount', type: 'number', required: true, min: 0, label: 'Shuma e paguar (€)' },
        { name: 'paidAt', type: 'date', required: true, label: 'Data e pagesës', defaultValue: () => new Date().toISOString() },
      ],
    },
    { name: 'note', type: 'textarea', label: 'Shënim' },
  ],
}
