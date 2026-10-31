'use client'

import React, { useMemo, useState } from 'react'
import { useField, useLocale } from '@payloadcms/ui'
import sq from '../../../messages/sq.json'
import en from '../../../messages/en.json'
import { flattenMessages, isSafeOverride, placeholders } from '../../lib/texts'

// Where each group of texts appears, in the client's words.
const GROUPS: Record<string, string> = {
  nav: 'Menyja lart dhe kërkimi',
  hero: 'Ballina — pjesa kryesore',
  brands: 'Ballina — brendet',
  about: 'Ballina — rreth nesh',
  devices: 'Ballina — pajisjet',
  bestSellers: 'Kartat e produkteve dhe "Më të shiturat"',
  categories: 'Ballina — kategoritë',
  why: 'Ballina — pse ne',
  newArrivals: 'Ballina — të rejat',
  education: 'Qendra edukative',
  promotions: 'Promocionet (kartat)',
  testimonials: 'Vlerësimet e klinikave',
  instagram: 'Instagram',
  newsletter: 'Newsletter',
  footer: 'Fundi i faqes (footer)',
  cart: 'Shporta',
  checkout: 'Checkout / porosia',
  account: 'Llogaria e klinikës (hyrja, regjistrimi, porositë)',
  productPage: 'Faqja e produktit',
  stock: 'Stoku i produkteve',
  pages: 'Faqet me tekst (privatësia, kushtet…)',
  contact: 'Faqja e kontaktit',
  catalogPage: 'Katalogu (Shop)',
  categoryPage: 'Faqja e kategorisë',
  promotionsPage: 'Faqja e promocioneve',
  wishlistPage: 'Të preferuarat',
  comingSoon: 'Faqet "Së shpejti"',
  brandPage: 'Faqja e brendit',
}

type Overrides = Record<string, string>

const box: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  marginBottom: 10,
  background: 'var(--theme-elevation-0)',
}

export function TextsEditor({ path }: { path: string }) {
  const { code } = useLocale()
  const { value, setValue } = useField<Overrides | null>({ path })
  const [query, setQuery] = useState('')
  const [onlyChanged, setOnlyChanged] = useState(false)

  const defaults = useMemo(() => flattenMessages(code === 'en' ? en : sq), [code])
  const overrides: Overrides = value && typeof value === 'object' ? value : {}
  const changedCount = Object.values(overrides).filter((v) => v?.trim()).length

  const update = (key: string, text: string) => {
    const next = { ...overrides }
    if (text.trim()) next[key] = text
    else delete next[key]
    setValue(next)
  }

  const q = query.trim().toLowerCase()
  const groups = useMemo(() => {
    const byGroup = new Map<string, string[]>()
    for (const key of Object.keys(defaults)) {
      const current = overrides[key] ?? ''
      if (onlyChanged && !current.trim()) continue
      if (q && !`${key} ${defaults[key]} ${current}`.toLowerCase().includes(q)) continue
      const group = key.split('.')[0]
      byGroup.set(group, [...(byGroup.get(group) ?? []), key])
    }
    return [...byGroup.entries()]
  }, [defaults, overrides, q, onlyChanged])

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Kërko tekst… (p.sh. porosi, butoni, email)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: '1 1 280px', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--theme-elevation-250)', background: 'var(--theme-input-bg)', color: 'var(--theme-text)' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} />
          Vetëm të ndryshuarat ({changedCount})
        </label>
        <span style={{ color: 'var(--theme-elevation-500)' }}>
          Gjuha: <strong>{code === 'en' ? 'English' : 'Shqip'}</strong> — ndërroje lart djathtas
        </span>
      </div>

      {groups.length === 0 && <p style={{ color: 'var(--theme-elevation-500)' }}>Asnjë tekst nuk përputhet me kërkimin.</p>}

      {groups.map(([group, keys]) => {
        const changedHere = keys.filter((k) => overrides[k]?.trim()).length
        return (
          <details key={group} style={box} open={Boolean(q) || onlyChanged}>
            <summary style={{ padding: '12px 16px', cursor: 'pointer', fontWeight: 600 }}>
              {GROUPS[group] ?? group}{' '}
              <span style={{ fontWeight: 400, color: 'var(--theme-elevation-500)' }}>
                — {keys.length} tekste{changedHere ? `, ${changedHere} të ndryshuara` : ''}
              </span>
            </summary>
            <div style={{ padding: '4px 16px 16px' }}>
              {keys.map((key) => {
                const def = defaults[key]
                const current = overrides[key] ?? ''
                const vars = placeholders(def)
                const broken = Boolean(current.trim()) && !isSafeOverride(def, current)
                const long = def.length > 70
                const inputStyle: React.CSSProperties = {
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: `1px solid ${broken ? 'var(--theme-error-500)' : 'var(--theme-elevation-250)'}`,
                  background: 'var(--theme-input-bg)',
                  color: 'var(--theme-text)',
                  font: 'inherit',
                  resize: 'vertical',
                }
                return (
                  <div key={key} style={{ padding: '10px 0', borderTop: '1px solid var(--theme-elevation-100)' }}>
                    <div style={{ fontSize: 12, color: 'var(--theme-elevation-500)', marginBottom: 4 }}>
                      Standard: <span style={{ color: 'var(--theme-elevation-800)' }}>{def}</span>
                    </div>
                    {long ? (
                      <textarea rows={3} value={current} placeholder={def} onChange={(e) => update(key, e.target.value)} style={inputStyle} />
                    ) : (
                      <input type="text" value={current} placeholder={def} onChange={(e) => update(key, e.target.value)} style={inputStyle} />
                    )}
                    {vars.length > 0 && (
                      <div style={{ fontSize: 11.5, color: broken ? 'var(--theme-error-500)' : 'var(--theme-elevation-500)', marginTop: 4 }}>
                        {broken
                          ? `Mungon ${vars.map((v) => `{${v}}`).join(', ')} ose kllapat s’janë të plota — derisa ta rregullosh, shfaqet teksti standard.`
                          : `Mbaje ${vars.map((v) => `{${v}}`).join(', ')} në tekst — zëvendësohet automatikisht.`}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </details>
        )
      })}
    </div>
  )
}
