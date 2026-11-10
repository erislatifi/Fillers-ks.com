import type { CollectionBeforeChangeHook, FieldAccess } from 'payload'

/** Commission data is internal: only people in the admin panel may read it. */
export const panelOnly: FieldAccess = ({ req }) => req.user?.collection === 'users'

const relId = (rel: unknown): number | null => {
  if (rel && typeof rel === 'object' && 'id' in rel) return Number((rel as { id: unknown }).id)
  return rel == null || rel === '' ? null : Number(rel)
}
const round2 = (n: number) => Math.round(n * 100) / 100

type Item = {
  product?: unknown
  price?: number | null
  quantity?: number | null
  commissionRate?: number | null
  commission?: number | null
  [key: string]: unknown
}

/**
 * Orders: stamps every item with the commission rate that applied when the order was
 * placed (product rate → agent's default → Settings default) and totals it, so later
 * changes to rates don't rewrite past months. A rate typed by an admin is kept; switching
 * the order to another agent re-applies that agent's rates.
 */
export const applyCommission: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const agentId = relId(data.agent !== undefined ? data.agent : originalDoc?.agent)
  const items: Item[] = (data.items ?? originalDoc?.items ?? []) as Item[]

  if (!agentId) {
    data.items = items.map((i) => ({ ...i, commissionRate: null, commission: null }))
    data.commissionTotal = 0
    return data
  }

  const agentChanged = originalDoc && relId(originalDoc.agent) !== agentId
  const needsLookup = items.some((i) => agentChanged || i.commissionRate == null)
  let agentRate: number | null = null
  let defaultRate = 0
  const productRates = new Map<number, number | null>()

  if (needsLookup) {
    const [agent, settings] = await Promise.all([
      req.payload.findByID({ collection: 'users', id: agentId, depth: 0, req }).catch(() => null),
      req.payload.findGlobal({ slug: 'site-settings', depth: 0, req }),
    ])
    agentRate = agent?.defaultCommissionRate ?? null
    defaultRate = settings.defaultCommissionRate ?? 0
    const ids = [...new Set(items.map((i) => relId(i.product)).filter((id): id is number => id !== null))]
    if (ids.length) {
      const products = await req.payload.find({
        collection: 'products',
        where: { id: { in: ids } },
        limit: ids.length,
        depth: 0,
        req,
      })
      for (const p of products.docs) productRates.set(p.id, p.commissionRate ?? null)
    }
  }

  // Commission is paid on what the clinic actually pays: a discount lowers it proportionally.
  const discountPercent = Number(data.discountPercent ?? originalDoc?.discountPercent ?? 0) || 0
  const factor = Math.min(1, Math.max(0, 1 - discountPercent / 100))

  let total = 0
  data.items = items.map((item) => {
    let rate = agentChanged ? null : item.commissionRate ?? null
    if (rate == null) {
      const productId = relId(item.product)
      rate = (productId !== null ? productRates.get(productId) : null) ?? agentRate ?? defaultRate
    }
    const commission = round2(((item.price ?? 0) * (item.quantity ?? 0) * factor * rate) / 100)
    total += commission
    return { ...item, commissionRate: rate, commission }
  })
  data.commissionTotal = round2(total)
  return data
}
