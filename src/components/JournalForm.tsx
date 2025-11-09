import { useEffect, useState } from 'react'
import type { Entry } from '../types'
import { toISO, todayISO, clamp } from '../types'

export function JournalForm({ initial, onSave, onClearEdit }: {
  initial?: Entry
  onSave: (e: Omit<Entry,'id'|'createdAt'|'updatedAt'>) => void
  onClearEdit?: () => void
}) {
  const [date, setDate] = useState<string>(initial?.date ?? todayISO())
  const [mood, setMood] = useState<number>(initial?.mood ?? 5)
  const [pain, setPain] = useState<number>(initial?.pain ?? 0)
  const [fatigue, setFatigue] = useState<number>(initial?.fatigue ?? 0)
  const [nausea, setNausea] = useState<number>(initial?.nausea ?? 0)
  const [notes, setNotes] = useState<string>(initial?.notes ?? '')
  const [tags, setTags] = useState<string>((initial?.tags ?? []).join(', '))

  useEffect(() => {
    if (!initial) return
    setDate(initial.date)
    setMood(initial.mood)
    setPain(initial.pain)
    setFatigue(initial.fatigue)
    setNausea(initial.nausea)
    setNotes(initial.notes ?? '')
    setTags((initial.tags ?? []).join(', '))
  }, [initial])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      date,
      mood: clamp(mood, 1, 10),
      pain: clamp(pain, 0, 10),
      fatigue: clamp(fatigue, 0, 10),
      nausea: clamp(nausea, 0, 10),
      notes: notes.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    })
  }

  return (
    <form className="card" onSubmit={submit}>
      {initial && (
        <div className="muted" style={{marginBottom: '.5rem'}}>Editing entry for <strong>{initial.date}</strong>. <button type="button" className="tab" onClick={onClearEdit}>New entry</button></div>
      )}
      <div className="grid">
        <Field label="Date">
          <input aria-label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} max={toISO(new Date())} required />
        </Field>
        <fieldset style={{border:'1px solid var(--border)', borderRadius: '8px', padding: '.75rem'}}>
          <legend>Today's symptoms</legend>
          <div className="grid">
            <Field label={`Mood: ${mood}`} hint="1 (low) – 10 (high)">
              <input aria-label="Mood" type="range" min={1} max={10} value={mood} onChange={e => setMood(parseInt(e.target.value))} />
            </Field>
            <Field label={`Pain: ${pain}`} hint="0 (none) – 10 (severe)">
              <input aria-label="Pain" type="range" min={0} max={10} value={pain} onChange={e => setPain(parseInt(e.target.value))} />
            </Field>
            <Field label={`Fatigue: ${fatigue}`} hint="0 (none) – 10 (severe)">
              <input aria-label="Fatigue" type="range" min={0} max={10} value={fatigue} onChange={e => setFatigue(parseInt(e.target.value))} />
            </Field>
            <Field label={`Nausea: ${nausea}`} hint="0 (none) – 10 (severe)">
              <input aria-label="Nausea" type="range" min={0} max={10} value={nausea} onChange={e => setNausea(parseInt(e.target.value))} />
            </Field>
          </div>
        </fieldset>
      </div>
      <Field label="Notes">
        <textarea rows={5} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything notable today?" />
      </Field>
      <Field label="Tags" hint="Comma-separated (e.g., chemo, headache)">
        <input type="text" value={tags} onChange={e => setTags(e.target.value)} />
      </Field>
      <div className="actions">
        <button type="submit" className="primary">Save Entry</button>
      </div>
    </form>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <div className="field-label">
        <span>{label}</span>
        {hint && <em>{hint}</em>}
      </div>
      {children}
    </label>
  )
}
