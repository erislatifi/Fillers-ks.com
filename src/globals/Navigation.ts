import type { GlobalConfig } from 'payload'
import { isStaff } from '../access/isAdmin'

// Header menu and the footer "Company" links. Empty lists = the built-in menus.
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Menytë',
  admin: {
    group: 'Përmbajtja',
    description: 'Menyja lart dhe lidhjet në fund të faqes. Zvarrit për t’i rirenditur. Lista bosh = menyja standarde.',
  },
  access: {
    read: () => true,
    update: isStaff,
  },
  versions: { max: 20 },
  fields: [
    {
      name: 'headerItems',
      type: 'array',
      label: 'Menyja lart',
      labels: { singular: 'Lidhje', plural: 'Lidhjet' },
      admin: { initCollapsed: true, components: { RowLabel: './components/admin/MenuRowLabel#MenuRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true, label: 'Teksti' },
            {
              name: 'type',
              type: 'select',
              defaultValue: 'link',
              label: 'Lloji',
              options: [
                { label: 'Lidhje', value: 'link' },
                { label: 'Lista e brendeve (dropdown)', value: 'brands' },
                { label: 'Lista e kategorive (dropdown)', value: 'categories' },
              ],
            },
            {
              name: 'href',
              type: 'text',
              label: 'Lidhja',
              admin: {
                description: 'P.sh. /catalog, /promotions, /info/kthimet ose https://…',
                condition: (_, sibling) => (sibling?.type ?? 'link') === 'link',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'footerLinks',
      type: 'array',
      label: 'Lidhjet në footer (kolona "Kompania")',
      labels: { singular: 'Lidhje', plural: 'Lidhjet' },
      admin: { initCollapsed: true, components: { RowLabel: './components/admin/MenuRowLabel#MenuRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true, label: 'Teksti' },
            { name: 'href', type: 'text', required: true, label: 'Lidhja' },
          ],
        },
      ],
    },
    {
      name: 'showWishlist',
      type: 'checkbox',
      defaultValue: true,
      label: 'Shfaq ikonën e "Të preferuarave" (zemra) lart',
    },
  ],
}
