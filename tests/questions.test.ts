import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addQuestion, updateQuestion, deleteQuestion, loadQuestions, saveQuestions, QUESTIONS_KEY, type QuestionType } from '../src/questions'

describe('questions helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-12-31T12:00:00.000Z'))
    let store: Record<string, string> = {}
    // @ts-expect-error
    global.localStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = v },
      removeItem: (k: string) => { delete store[k] },
      clear: () => { store = {} },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length },
    }
  })

  it('add/update/delete question and persist', () => {
    const type: QuestionType = 'consultant'
    let qs = addQuestion([], { text: 'What are the next steps?', type })
    expect(qs).toHaveLength(1)
    expect(qs[0].status).toBe('unasked')
    qs = updateQuestion(qs, qs[0].id, { status: 'answered' })
    expect(qs[0].status).toBe('answered')
    saveQuestions(qs)
    const loaded = loadQuestions()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].text).toContain('next steps')
    // Check storage key
    // @ts-expect-error
    expect(global.localStorage.getItem(QUESTIONS_KEY)).toBeTruthy()
    const qs2 = deleteQuestion(loaded, loaded[0].id)
    expect(qs2).toHaveLength(0)
  })
})

