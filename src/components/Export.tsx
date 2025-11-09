import type { Entry } from '../types'
import { todayISO } from '../types'
import { toCSV, mergeImported, sanitize } from '../storage'
import { download } from '../utils'
import { useToast } from '../toast'
import { useConfirm } from '../confirm'
import { getLastBackup, markBackup } from '../backup'

export function Export({ entries, onImport }: { entries: Entry[]; onImport: (next: Entry[]) => void }) {
  const json = JSON.stringify(entries, null, 2)
  const toast = useToast()
  const confirm = useConfirm()
  const lastBackup = getLastBackup()

  const generateIconPng = async (size: 192 | 512) => {
    try {
      const img = new Image()
      img.src = '/icon-maskable.svg'
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0,0,size,size)
      ctx.drawImage(img, 0, 0, size, size)
      const data = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = data
      a.download = `icon-${size}.png`
      a.click()
      toast(`Generated icon-${size}.png`, 'success')
    } catch (e) {
      toast('Failed to generate icon', 'error')
    }
  }

  const handleImport = async (file: File) => {
    const text = await file.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { toast('Invalid JSON', 'error'); return }
    const arr = Array.isArray(data) ? data : (Array.isArray((data as any)?.entries) ? (data as any).entries : null)
    if (!Array.isArray(arr)) { toast('Expected array or { entries: [...] }', 'error'); return }
    const imported = arr.map(sanitize)
    const { next, conflicts } = mergeImported(entries, imported, false)
    if (conflicts.length > 0) {
      const ok = await confirm({ message: `${conflicts.length} existing date${conflicts.length===1?'':'s'} found. Overwrite them?`, confirmText: 'Overwrite', cancelText: 'Keep existing' })
      const final = mergeImported(entries, imported, ok).next
      onImport(final)
      toast(`Imported ${imported.length} entr${imported.length===1?'y':'ies'}${ok ? ' (overwrote conflicts)' : ''}.`, 'success')
    } else {
      onImport(next)
      toast(`Imported ${imported.length} entr${imported.length===1?'y':'ies'}.`, 'success')
    }
  }

  return (
    <div className="card export">
      <div className="actions">
        <button className="primary" onClick={() => { download(`journal-${todayISO()}.json`, 'application/json', json); markBackup(); toast('Backup saved', 'success') }}>Download JSON</button>
        <button onClick={() => download(`journal-${todayISO()}.csv`, 'text/csv', toCSV(entries))}>Download CSV</button>
        <label className="tab" style={{display:'inline-flex', alignItems:'center', gap:'.5rem', cursor:'pointer'}}>
          Import JSON
          <input type="file" accept="application/json" style={{display:'none'}} onChange={e => {
            const f = e.target.files?.[0]
            if (f) handleImport(f)
            e.currentTarget.value = ''
          }} />
        </label>
      </div>
      <small className="muted">Last backup: {lastBackup ? lastBackup.slice(0,10) : 'never'}</small>
      <details>
        <summary>Preview JSON</summary>
        <pre className="preview">{json}</pre>
      </details>
      <details style={{marginTop:'.5rem'}}>
        <summary>App Icons (PNG export)</summary>
        <p className="muted">Generate PNG icons from the bundled SVG. Download and place into <code>public/</code> as <code>icon-192.png</code> and <code>icon-512.png</code>.</p>
        <div className="actions">
          <button className="tab" onClick={() => generateIconPng(192)}>Download 192px PNG</button>
          <button className="tab" onClick={() => generateIconPng(512)}>Download 512px PNG</button>
        </div>
      </details>
    </div>
  )
}
