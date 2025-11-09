import { useState } from 'react'
import type { Entry } from '../types'
import { useConfirm } from '../confirm'

export function History({ entries, onDelete, onEdit }: {
  entries: Entry[]
  onDelete: (id: string) => void
  onEdit: (entry: Entry) => void
}) {
  const sorted = [...entries].sort((a,b) => b.date.localeCompare(a.date))
  const [q, setQ] = useState('')
  const filtered = sorted.filter(e => !q || (e.tags ?? []).some(t => t.toLowerCase().includes(q.toLowerCase())) || (e.notes ?? '').toLowerCase().includes(q.toLowerCase()))
  const confirm = useConfirm()
  const confirmDelete = async (e: Entry) => {
    const ok = await confirm({ message: `Delete entry for ${e.date}? This cannot be undone.`, confirmText: 'Delete', cancelText: 'Cancel', destructive: true })
    if (ok) onDelete(e.id)
  }

  return (
    <div className="card">
      <div className="history-controls">
        <input placeholder="Filter by tag or note" value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="tab" onClick={()=>setQ('')} disabled={!q}>Clear</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <caption className="sr-only">Journal history</caption>
          <thead>
            <tr>
              <th scope="col">Date</th><th scope="col">Mood</th><th scope="col">Pain</th><th scope="col">Fatigue</th><th scope="col">Nausea</th><th scope="col">Tags</th><th scope="col">Notes</th><th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} onDoubleClick={() => onEdit(e)} style={{cursor:'pointer'}}>
                <td>{e.date}</td>
                <td>{e.mood}</td>
                <td>{e.pain}</td>
                <td>{e.fatigue}</td>
                <td>{e.nausea}</td>
                <td>{(e.tags ?? []).join(', ')}</td>
                <td className="notes-cell">{e.notes}</td>
                <td className="row-actions">
                  <button className="tab" onClick={() => onEdit(e)}>Edit</button>
                  <button className="danger" onClick={() => confirmDelete(e)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{textAlign:'center', color:'var(--muted)'}}>No entries</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
