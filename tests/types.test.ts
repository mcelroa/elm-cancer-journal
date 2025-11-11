import { describe, it, expect } from 'vitest'
import { formatDate } from '../src/types.ts'

describe('formatDate', () => {
  it('formats ISO date to DD/MM/YYYY', () => {
    expect(formatDate('2025-01-09')).toBe('09/01/2025')
  })

  it('passes through invalid input', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
    expect(formatDate('')).toBe('')
  })
})

