import type { CollectionConfig } from 'payload'

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
  admin: {
    useAsTitle: 'orderNumber',
    group: 'Sales',
    defaultColumns: ['orderNumber', 'clinicName', 'status', 'requestedDeliveryDate', 'subtotal', 'createdAt'],
  },
  access: {
    // Checkout submits orders without being logged in.
    create: () => true,
    // Order contents include clinic contact details — restrict to logged-in admins.
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      admin: { readOnly: true },
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
      options: ['pending', 'confirmed', 'fulfilled', 'cancelled'],
    },
    { name: 'clinicName', type: 'text', required: true },
    { name: 'contactName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'deliveryAddress', type: 'textarea', required: true },
    { name: 'requestedDeliveryDate', type: 'date', required: true },
    { name: 'notes', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        { name: 'name', type: 'text', required: true },
        { name: 'brandName', type: 'text' },
        { name: 'size', type: 'text' },
        { name: 'price', type: 'number', required: true },
        { name: 'quantity', type: 'number', required: true, min: 1 },
      ],
    },
    { name: 'subtotal', type: 'number', required: true },
  ],
}
