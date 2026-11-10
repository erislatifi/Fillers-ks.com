import type { AccessResult, CollectionConfig, FieldAccess } from 'payload'
import { hiddenForNonSales, isAdmin, isAdminUser, isAgentUser } from '../access/isAdmin'
import { applyCommission, panelOnly } from '../lib/commission'
import { countryOptions } from '../lib/countries'

// Internal fields: a logged-in clinic can read its own orders, but never these.
const staffOnly: FieldAccess = ({ req }) => isAdminUser(req)

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
    hidden: hiddenForNonSales,
    defaultColumns: ['orderNumber', 'clinicName', 'status', 'deliveryMethod', 'paymentMethod', 'total', 'createdAt'],
    description: 'Kërkesat që dërgojnë klinikat nga shporta. Hapi një porosi për ta konfirmuar dhe për të ndryshuar statusin.',
  },
  access: {
    // Checkout submits orders without being logged in.
    create: () => true,
    // Order contents include clinic contact details — staff see all, a customer only their own.
    read: ({ req }): AccessResult => {
      if (isAdminUser(req)) return true
      // A sales agent sees only the orders credited to them.
      if (isAgentUser(req)) return { agent: { equals: req.user!.id } }
      if (req.user?.collection === 'customers') return { customer: { equals: req.user.id } }
      return false
    },
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    // Record every status change (and the initial "pending") with who made it and when.
    beforeChange: [
      ({ data, originalDoc, operation, req }) => {
        const status = data.status ?? originalDoc?.status ?? 'pending'
        if (operation === 'update' && status === originalDoc?.status) return data
        const history = data.statusHistory ?? originalDoc?.statusHistory ?? []
        data.statusHistory = [
          ...history,
          { status, changedAt: new Date().toISOString(), changedBy: req.user?.email ?? 'checkout' },
        ]
        return data
      },
      applyCommission,
    ],
  },
  fields: [
    {
      name: 'printButtons',
      type: 'ui',
      admin: { position: 'sidebar', components: { Field: './components/admin/OrderPrintButtons#OrderPrintButtons' } },
    },
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
      name: 'deliveryMethod',
      type: 'select',
      required: true,
      defaultValue: 'pickup',
      label: 'Mënyra e marrjes',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Merret në zyrën tonë', value: 'pickup' },
        { label: 'Dërgesë me korrier', value: 'courier' },
      ],
    },
    {
      // `pickup` predates deliveryMethod and now means "paid at our office"; the value
      // is kept so older orders stay valid.
      name: 'paymentMethod',
      type: 'select',
      required: true,
      defaultValue: 'pickup',
      label: 'Mënyra e pagesës',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Pagesë në zyrë', value: 'pickup' },
        { label: 'Transfer bankar', value: 'bank_transfer' },
        { label: 'Cash te korrieri', value: 'cash_on_delivery' },
      ],
    },
    {
      type: 'row',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'subtotal', type: 'number', required: true, label: 'Produktet (€)' },
        {
          name: 'shippingCost',
          type: 'number',
          min: 0,
          label: 'Transporti (€)',
          admin: { description: 'Bosh = konfirmohet nga ekipi.' },
        },
      ],
    },
    {
      type: 'row',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'discountPercent',
          type: 'number',
          min: 0,
          max: 100,
          label: 'Zbritja (%)',
          admin: { description: 'E dhënë nga agjenti (deri në kufirin e tij).' },
        },
        { name: 'discountAmount', type: 'number', min: 0, label: 'Zbritja (€)', admin: { readOnly: true } },
      ],
    },
    {
      name: 'total',
      type: 'number',
      label: 'Totali për pagesë (€)',
      admin: { position: 'sidebar', description: 'Produktet − zbritja + transporti.' },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website',
      label: 'Burimi',
      admin: { position: 'sidebar', readOnly: true },
      options: [
        { label: 'Faqja (shporta)', value: 'website' },
        { label: 'Tableti i agjentit', value: 'agent_tablet' },
      ],
    },
    {
      name: 'visit',
      type: 'relationship',
      relationTo: 'visits',
      label: 'Vizita',
      access: { read: panelOnly },
      admin: { position: 'sidebar', readOnly: true, condition: (data) => Boolean(data?.visit) },
    },
    {
      type: 'row',
      admin: { position: 'sidebar', condition: (data) => Boolean(data?.signature) },
      fields: [
        { name: 'signature', type: 'upload', relationTo: 'media', label: 'Nënshkrimi i klinikës', admin: { readOnly: true } },
        { name: 'signedBy', type: 'text', label: 'Nënshkroi', admin: { readOnly: true } },
      ],
    },
    {
      // Set by the agent's tablet so an order synced twice (offline retries) is stored once.
      name: 'clientId',
      type: 'text',
      unique: true,
      index: true,
      admin: { hidden: true },
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
      // Credited sales agent: from the clinic's assigned agent or the agent's link at checkout;
      // an admin can set or change it. Changing it re-applies that agent's rates.
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      label: 'Agjenti i shitjes',
      filterOptions: { roles: { in: ['agent'] } },
      access: { read: panelOnly, update: ({ req }) => isAdminUser(req), create: ({ req }) => isAdminUser(req) },
      admin: { position: 'sidebar', description: 'Kujt i llogaritet komisioni për këtë porosi.' },
    },
    {
      name: 'commissionTotal',
      type: 'number',
      label: 'Komisioni (€)',
      access: { read: panelOnly },
      admin: { position: 'sidebar', readOnly: true, description: 'Llogaritet vetë nga përqindjet e artikujve.' },
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
        // City and address are only required for courier delivery — checked at checkout.
        {
          type: 'row',
          fields: [
            { name: 'country', type: 'select', defaultValue: 'XK', label: 'Shteti', options: countryOptions },
            { name: 'city', type: 'text', label: 'Qyteti' },
            {
              name: 'requestedDeliveryDate',
              type: 'date',
              label: 'Data e kërkuar e dorëzimit',
              admin: { description: 'Bosh = sa më shpejt.' },
            },
          ],
        },
        { name: 'deliveryAddress', type: 'textarea', label: 'Adresa e dorëzimit' },
        { name: 'notes', type: 'textarea', label: 'Shënime nga klienti' },
        {
          type: 'row',
          fields: [
            { name: 'shippingZone', type: 'text', label: 'Zona e dërgesës', admin: { readOnly: true, description: 'E gjetur automatikisht nga adresa.' } },
            { name: 'courierName', type: 'text', label: 'Korrieri', admin: { description: 'P.sh. PostaExpress' } },
            { name: 'trackingNumber', type: 'text', label: 'Numri i gjurmimit' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Shënime të brendshme dhe historiku',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'internalNotes',
          type: 'textarea',
          label: 'Shënime të brendshme',
          access: { read: staffOnly },
          admin: { description: 'Vetëm për ekipin — klienti nuk i sheh kurrë.' },
        },
        {
          name: 'statusHistory',
          type: 'array',
          label: 'Historiku i statusit',
          labels: { singular: 'Ndryshim', plural: 'Ndryshimet' },
          access: { read: staffOnly },
          admin: { readOnly: true, initCollapsed: true },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  label: 'Statusi',
                  options: [
                    { label: 'Në pritje', value: 'pending' },
                    { label: 'Konfirmuar', value: 'confirmed' },
                    { label: 'Dorëzuar', value: 'fulfilled' },
                    { label: 'Anuluar', value: 'cancelled' },
                  ],
                },
                { name: 'changedAt', type: 'date', label: 'Kur', admin: { date: { pickerAppearance: 'dayAndTime' } } },
                { name: 'changedBy', type: 'text', label: 'Nga' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Faturimi për biznes',
      admin: { initCollapsed: false },
      fields: [
        { name: 'needsInvoice', type: 'checkbox', defaultValue: false, label: 'Kërkon faturë për biznes' },
        {
          name: 'invoice',
          type: 'group',
          label: false,
          admin: { condition: (data) => Boolean(data?.needsInvoice) },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'companyName', type: 'text', label: 'Emri i biznesit' },
                { name: 'nui', type: 'text', label: 'NUI' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'fiscalNumber', type: 'text', label: 'Numri fiskal' },
                { name: 'vatNumber', type: 'text', label: 'Numri i TVSH-së' },
              ],
            },
            { name: 'address', type: 'textarea', label: 'Adresa e faturimit' },
          ],
        },
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
        {
          type: 'row',
          fields: [
            {
              name: 'commissionRate',
              type: 'number',
              min: 0,
              max: 100,
              label: 'Komisioni (%)',
              access: { read: panelOnly, update: ({ req }) => isAdminUser(req) },
              admin: { description: 'Vendoset vetë; mund ta ndryshosh për këtë porosi.' },
            },
            {
              name: 'commission',
              type: 'number',
              label: 'Komisioni (€)',
              access: { read: panelOnly },
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
  ],
}
