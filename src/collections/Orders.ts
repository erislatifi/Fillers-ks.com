import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminUser } from '../access/isAdmin'

function generateOrderNumber() {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `FK-${y}${m}${d}-${rand}`
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Porosi', plural: 'Porositë' },
  admin: {
    useAsTitle: 'orderNumber',
    group: 'Shitjet',
    defaultColumns: ['orderNumber', 'clinicName', 'status', 'paymentMethod', 'requestedDeliveryDate', 'subtotal', 'createdAt'],
    description: 'Kërkesat që dërgojnë klinikat nga shporta. Hapi një porosi për ta konfirmuar dhe për të ndryshuar statusin.',
  },
  access: {
    // Checkout submits orders without being logged in.
    create: () => true,
    // Order contents include clinic contact details — staff see all, a customer only their own.
    read: ({ req }) => {
      if (isAdminUser(req)) return true
      if (req.user?.collection === 'customers') return { customer: { equals: req.user.id } }
      return false
    },
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      label: 'Numri i porosisë',
      admin: { readOnly: true, position: 'sidebar' },
      hooks: {
        beforeValidate: [
          ({ value }) => value || generateOrderNumber(),
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      label: 'Statusi',
      admin: { position: 'sidebar', description: 'Ndryshoje sapo ta konfirmosh ose ta dorëzosh porosinë.' },
      options: [
        { label: 'Në pritje', value: 'pending' },
        { label: 'Konfirmuar', value: 'confirmed' },
        { label: 'Dorëzuar', value: 'fulfilled' },
        { label: 'Anuluar', value: 'cancelled' },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      defaultValue: 'pickup',
      label: 'Mënyra e pagesës',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Marrje në zyrën tonë', value: 'pickup' },
        { label: 'Transfer bankar', value: 'bank_transfer' },
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      label: 'Totali (€)',
      admin: { position: 'sidebar' },
    },
    {
      // Set server-side at checkout when the clinic is logged in; empty for guest orders.
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      label: 'Llogaria e klientit',
      admin: { position: 'sidebar', description: 'Bosh nëse porosia u bë pa llogari.' },
    },
    {
      type: 'collapsible',
      label: 'Klinika dhe kontakti',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'clinicName', type: 'text', required: true, label: 'Klinika' },
            { name: 'contactName', type: 'text', required: true, label: 'Personi kontaktues' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'email', type: 'email', required: true, label: 'Email' },
            { name: 'phone', type: 'text', required: true, label: 'Telefoni' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Dorëzimi',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'city', type: 'text', required: true, label: 'Qyteti' },
            { name: 'requestedDeliveryDate', type: 'date', required: true, label: 'Data e kërkuar e dorëzimit' },
          ],
        },
        { name: 'deliveryAddress', type: 'textarea', required: true, label: 'Adresa e dorëzimit' },
        { name: 'notes', type: 'textarea', label: 'Shënime nga klienti' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      label: 'Artikujt e porosisë',
      labels: { singular: 'Artikull', plural: 'Artikujt' },
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', label: 'Produkti (lidhja)' },
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'Emri' },
            { name: 'brandName', type: 'text', label: 'Brendi' },
            { name: 'size', type: 'text', label: 'Madhësia' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'price', type: 'number', required: true, label: 'Çmimi (€)' },
            { name: 'quantity', type: 'number', required: true, min: 1, label: 'Sasia' },
          ],
        },
      ],
    },
  ],
}
