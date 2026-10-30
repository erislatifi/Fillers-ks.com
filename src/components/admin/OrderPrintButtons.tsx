'use client'

import { useDocumentInfo } from '@payloadcms/ui'

// Sidebar links on an order: open the proforma invoice / packing slip in a new tab.
export function OrderPrintButtons() {
  const { id } = useDocumentInfo()
  if (!id) return null
  return (
    <div className="fk-print-buttons" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
      <a className="btn btn--style-secondary btn--size-small" href={`/print/order/${id}`} target="_blank" rel="noreferrer">
        Printo faturën
      </a>
      <a
        className="btn btn--style-secondary btn--size-small"
        href={`/print/order/${id}?type=packing`}
        target="_blank"
        rel="noreferrer"
      >
        Fletë paketimi
      </a>
    </div>
  )
}
