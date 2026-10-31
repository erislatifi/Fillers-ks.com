'use client'

import { useRowLabel } from '@payloadcms/ui'

// "Shop → /catalog" instead of "Lidhje 01" in the menu lists.
export function MenuRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string; href?: string; type?: string }>()
  const target = data?.type === 'brands' ? 'brendet' : data?.type === 'categories' ? 'kategoritë' : data?.href
  return (
    <span>
      {data?.label || `Lidhje ${(rowNumber ?? 0) + 1}`}
      {target ? ` → ${target}` : ''}
    </span>
  )
}
