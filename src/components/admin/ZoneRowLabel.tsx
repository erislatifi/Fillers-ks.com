'use client'

import { useRowLabel } from '@payloadcms/ui'

// "Prishtinë — €2" instead of "Zonë 01" in the shipping zones list.
export function ZoneRowLabel() {
  const { data, rowNumber } = useRowLabel<{ name?: string; price?: number }>()
  return (
    <span>
      {data?.name || `Zonë ${(rowNumber ?? 0) + 1}`}
      {typeof data?.price === 'number' ? ` — €${data.price}` : ''}
    </span>
  )
}
