import type { Entry } from './types'

const STORAGE_KEY = 'cancerJournal.v1.entries'
export { STORAGE_KEY }

export const loadEntries = (): Entry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(sanitize).filter(Boolean) as Entry[]
  } catch {
    return []
  }
}

export const saveEntries = (entries: Entry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export const upsertEntry = (
  entries: Entry[],
  input: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<Entry, 'id' | 'createdAt'>>,
): Entry[] => {
  const idx = entries.findIndex(e => e.date === input.date)
  const now = new Date().toISOString()
  if (idx >= 0) {
    const existing = entries[idx]
    const updated: Entry = {
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now,
    }
    const next = [...entries]
    next[idx] = updated
    return next
  }
  const id = input.id ?? `entry-${input.date}`
  const createdAt = input.createdAt ?? now
  return [ ...entries, { ...input, id, createdAt, updatedAt: now } ]
}

export const deleteEntry = (entries: Entry[], id: string) => entries.filter(e => e.id !== id)

export const toCSV = (entries: Entry[]) => {
  const header = ['date','mood','pain','fatigue','nausea','notes','tags']
  const rows = [...entries]
    .sort((a,b) => a.date.localeCompare(b.date))
    .map(e => [
      e.date,
      String(e.mood),
      String(e.pain),
      String(e.fatigue),
      String(e.nausea),
      (e.notes ?? '').replaceAll('"', '""'),
      (e.tags ?? []).join('|').replaceAll('"','""'),
    ].map(v => /[",\n]/.test(v) ? `"${v}"` : v).join(','))
  return [header.join(','), ...rows].join('\n')
}

export const sanitize = (x: any): Entry => {
  const now = new Date().toISOString()
  const date = String(x?.date ?? '').slice(0,10)
  const mood = toNum(x?.mood, 5)
  const pain = toNum(x?.pain, 0)
  const fatigue = toNum(x?.fatigue, 0)
  const nausea = toNum(x?.nausea, 0)
  const notes = typeof x?.notes === 'string' && x.notes.trim() ? x.notes : undefined
  const tags = Array.isArray(x?.tags) ? x.tags.filter(Boolean).map(String) : undefined
  const id = typeof x?.id === 'string' && x.id ? x.id : `entry-${date}`
  const createdAt = typeof x?.createdAt === 'string' && x.createdAt ? x.createdAt : now
  const updatedAt = typeof x?.updatedAt === 'string' && x.updatedAt ? x.updatedAt : now
  return { id, date, mood, pain, fatigue, nausea, notes, tags, createdAt, updatedAt }
}

const toNum = (v: any, fallback: number) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export const mergeImported = (
  existing: Entry[],
  imported: Entry[],
  overwrite: boolean,
) => {
  const byDate = new Map(existing.map(e => [e.date, e] as const))
  const conflicts: string[] = []
  for (const e of imported) {
    const safe = sanitize(e)
    if (byDate.has(safe.date)) {
      conflicts.push(safe.date)
      if (overwrite) byDate.set(safe.date, { ...byDate.get(safe.date)!, ...safe, id: `entry-${safe.date}`, updatedAt: new Date().toISOString() })
    } else {
      byDate.set(safe.date, safe)
    }
  }
  const next = Array.from(byDate.values())
  return { next, conflicts }
}
