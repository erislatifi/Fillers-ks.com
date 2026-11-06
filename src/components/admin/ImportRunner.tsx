'use client'

import React, { useState } from 'react'

type Line = { name: string; status: 'created' | 'updated' | 'skipped' | 'error'; note?: string }

const LABEL: Record<Line['status'], string> = {
  created: 'U shtua',
  updated: 'U përditësua',
  skipped: 'U fsheh',
  error: 'Gabim',
}
const COLOR: Record<Line['status'], string> = {
  created: 'var(--theme-success-500, #16a34a)',
  updated: 'var(--theme-elevation-800)',
  skipped: 'var(--theme-elevation-500)',
  error: 'var(--theme-error-500, #dc2626)',
}

/** Calls /tools/wp-import batch by batch and shows progress (Administrimi → Importo nga WordPress). */
export function ImportRunner() {
  const [hideOthers, setHideOthers] = useState(false)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(0)
  const [total, setTotal] = useState<number | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [error, setError] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)

  async function run() {
    setRunning(true)
    setError(null)
    setFinished(false)
    setLines([])
    setDone(0)
    let offset: number | null = 0
    while (offset !== null) {
      const res: Response = await fetch('/tools/wp-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ offset, hideOthers }),
      })
      const json = await res.json().catch(() => ({ error: `Gabim ${res.status}` }))
      if (!res.ok || json.error) {
        setError(`${json.error ?? `Gabim ${res.status}`} — mund ta nisësh prapë; produktet e importuara s'dyfishohen.`)
        break
      }
      setTotal(json.total)
      setLines((prev) => [...prev, ...json.lines])
      setDone((d) => d + json.lines.filter((l: Line) => l.status !== 'skipped').length)
      offset = json.next
      if (offset === null) setFinished(true)
    }
    setRunning(false)
  }

  const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0
  const count = (s: Line['status']) => lines.filter((l) => l.status === s).length

  return (
    <div style={{ maxWidth: 860 }}>
      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '16px 0', cursor: 'pointer' }}>
        <input type="checkbox" checked={hideOthers} disabled={running} onChange={(e) => setHideOthers(e.target.checked)} style={{ marginTop: 4 }} />
        <span>
          <strong>Fshih produktet që s’janë në WordPress</strong>
          <br />
          <span style={{ color: 'var(--theme-elevation-500)', fontSize: 13 }}>
            P.sh. produktet demo (“test”, Bonetta, Jalupro, Clarius…). Fshihen nga faqja, nuk fshihen nga admini — mund t’i shfaqësh prapë me tikun “I dukshëm në faqe”.
          </span>
        </span>
      </label>

      <button type="button" className="fk-btn" onClick={run} disabled={running}>
        {running ? 'Duke importuar…' : finished ? 'Importo prapë' : 'Fillo importin'}
      </button>

      {(running || total !== null) && (
        <div style={{ marginTop: 20 }}>
          <div style={{ height: 10, borderRadius: 99, background: 'var(--theme-elevation-100)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--fk-accent, #e91e8c)', transition: 'width .3s' }} />
          </div>
          <p style={{ marginTop: 8, color: 'var(--theme-elevation-600)' }}>
            {done} / {total ?? '…'} produkte · {count('created')} të reja · {count('updated')} të përditësuara
            {count('error') ? ` · ${count('error')} gabime` : ''}
            {count('skipped') ? ` · ${count('skipped')} të fshehura` : ''}
          </p>
        </div>
      )}

      {finished && !error && (
        <p className="fk-note" style={{ marginTop: 12 }}>
          ✓ Importi përfundoi. Shiko <a href="/admin/collections/products">Produktet</a> — çdo produkt mund ta ndryshosh si zakonisht.
        </p>
      )}
      {error && <p style={{ marginTop: 12, color: 'var(--theme-error-500, #dc2626)' }}>{error}</p>}

      {lines.length > 0 && (
        <div className="fk-table-wrap" style={{ marginTop: 20 }}>
          <table className="fk-table">
            <thead>
              <tr>
                <th>Produkti</th>
                <th>Rezultati</th>
                <th>Shënim</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i}>
                  <td>{l.name}</td>
                  <td style={{ color: COLOR[l.status], fontWeight: 600 }}>{LABEL[l.status]}</td>
                  <td>{l.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
