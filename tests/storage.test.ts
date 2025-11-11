import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { sanitize, upsertEntry, toCSV, mergeImported, STORAGE_KEY, loadEntries, saveEntries } from '../src/storage'

const fixedNow = new Date('2024-12-31T12:00:00.000Z')

describe('storage helpers', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
    // mock localStorage
    let store: Record<string, string> = {}
    // @ts-expect-error attach to global for tests
    global.localStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = v },
      removeItem: (k: string) => { delete store[k] },
      clear: () => { store = {} },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length },
    }
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('sanitizes partial entry and fills defaults', () => {
    const e = sanitize({ date: '2024-12-30', mood: 7 })
    expect(e.id).toBe('entry-2024-12-30')
    expect(e.createdAt).toBeTypeOf('string')
    expect(e.pain).toBe(0)
  })

  it('upserts by date: updates when date exists, otherwise adds', () => {
    const a = sanitize({ date: '2024-12-30', mood: 5, pain: 1, fatigue: 2, nausea: 3 })
    const list1 = upsertEntry([], a)
    expect(list1).toHaveLength(1)
    const b = sanitize({ date: '2024-12-30', mood: 8, pain: 0, fatigue: 1, nausea: 2 })
    const list2 = upsertEntry(list1, b)
    expect(list2).toHaveLength(1)
    expect(list2[0].mood).toBe(8)
    const c = sanitize({ date: '2024-12-31', mood: 6, pain: 1, fatigue: 1, nausea: 1 })
    const list3 = upsertEntry(list2, c)
    expect(list3).toHaveLength(2)
  })

  it('toCSV quotes values with commas or newlines and joins tags with |', () => {
    const entries = [
      sanitize({ date: '2024-12-29', mood: 5, pain: 1, fatigue: 2, nausea: 3, notes: 'ok', tags: ['a','b'] }),
      sanitize({ date: '2024-12-30', mood: 6, pain: 0, fatigue: 1, nausea: 1, notes: 'line1\nline2', tags: ['x,y'] }),
    ]
    const csv = toCSV(entries)
    const records = csvRecords(csv)
    expect(records[0]).toBe('date,mood,pain,fatigue,nausea,notes,tags')
    expect(records).toContain('2024-12-29,5,1,2,3,ok,a|b')
    const row = records.find(l => l.startsWith('2024-12-30'))!
    expect(row).toMatch(/"line1\nline2"/) // notes quoted with newline preserved
    expect(row).toMatch(/("x,y"|x\|y)/) // tags either quoted or joined by |
  })

  it('mergeImported reports conflicts and overwrites conditionally', () => {
    const existing = [sanitize({ date: '2024-12-30', mood: 5, pain:1, fatigue:2, nausea:3 })]
    const imported = [sanitize({ date: '2024-12-30', mood: 8, pain:0, fatigue:0, nausea:0 })]
    const res1 = mergeImported(existing, imported, false)
    expect(res1.conflicts).toEqual(['2024-12-30'])
    expect(res1.next.find(e => e.date==='2024-12-30')!.mood).toBe(5)
    const res2 = mergeImported(existing, imported, true)
    expect(res2.next.find(e => e.date==='2024-12-30')!.mood).toBe(8)
  })

  it('load/save roundtrip via localStorage', () => {
    const entries = [sanitize({ date: '2024-12-30', mood: 5, pain:1, fatigue:2, nausea:3 })]
    saveEntries(entries)
    const got = loadEntries()
    expect(got).toHaveLength(1)
    expect(got[0].date).toBe('2024-12-30')
    // Ensure correct storage key used
    // @ts-expect-error
    expect(global.localStorage.getItem(STORAGE_KEY)).toBeTruthy()
  })
})

// Minimal CSV record splitter that handles newlines inside quoted fields (quotes doubled)
function csvRecords(csv: string): string[] {
  const out: string[] = []
  const lines = csv.split('\n')
  let buf = ''
  let open = false
  for (const line of lines) {
    const part = (buf ? '\n' : '') + line
    buf += part
    // count unescaped quotes in current addition
    const quotes = (line.match(/"/g) ?? []).length
    // flip open if odd number of quotes encountered in this segment
    if (quotes % 2 === 1) open = !open
    if (!open) {
      out.push(buf)
      buf = ''
    }
  }
  if (buf) out.push(buf)
  return out
}
