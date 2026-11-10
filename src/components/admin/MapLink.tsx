'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

const href = (lat?: unknown, lng?: unknown) =>
  typeof lat === 'number' && typeof lng === 'number' ? `https://www.google.com/maps?q=${lat},${lng}` : null

/** Agent location document: "Shiko në hartë" link built from the lat/lng fields. */
export function MapLink() {
  const lat = useFormFields(([fields]) => fields.lat?.value)
  const lng = useFormFields(([fields]) => fields.lng?.value)
  const url = href(lat, lng)
  if (!url) return null
  return (
    <p style={{ margin: '8px 0 24px' }}>
      <a href={url} target="_blank" rel="noreferrer" className="fk-btn">
        Shiko në hartë ↗
      </a>
    </p>
  )
}

/** Same link in the list view. */
export function MapLinkCell({ rowData }: { rowData?: { lat?: number; lng?: number } }) {
  const url = href(rowData?.lat, rowData?.lng)
  if (!url) return <span>—</span>
  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
      Harta ↗
    </a>
  )
}
