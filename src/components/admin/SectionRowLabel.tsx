'use client'

import { useRowLabel } from '@payloadcms/ui'

const NAMES: Record<string, string> = {
  brands: 'Brendet',
  about: 'Rreth nesh',
  devices: 'Pajisjet',
  bestSellers: 'Më të shiturat',
  categories: 'Kategoritë',
  why: 'Pse ne',
  newArrivals: 'Të rejat',
  education: 'Qendra edukative',
  promotions: 'Promocionet',
  testimonials: 'Vlerësimet',
  instagram: 'Instagram',
  newsletter: 'Newsletter',
}

// Shows "3. Pse ne (fshehur)" instead of "Seksion 03" in Ballina → Seksionet.
export function SectionRowLabel() {
  const { data, rowNumber } = useRowLabel<{ section?: string; enabled?: boolean }>()
  const name = (data?.section && NAMES[data.section]) || 'Seksion i ri'
  return (
    <span>
      {(rowNumber ?? 0) + 1}. {name}
      {data?.enabled === false ? ' (fshehur)' : ''}
    </span>
  )
}
