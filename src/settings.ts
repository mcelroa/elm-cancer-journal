import type { Tab } from './types'

export type Settings = {
  remindersEnabled: boolean
  startTab: Tab
}

const SETTINGS_KEY = 'cancerJournal.v1.settings'

export const DEFAULT_SETTINGS: Settings = {
  remindersEnabled: true,
  startTab: 'journal',
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const obj = JSON.parse(raw)
    const remindersEnabled = typeof obj?.remindersEnabled === 'boolean' ? obj.remindersEnabled : DEFAULT_SETTINGS.remindersEnabled
    const startTab: Tab = ['journal','history','trends','export','settings'].includes(obj?.startTab) ? obj.startTab : DEFAULT_SETTINGS.startTab
    return { remindersEnabled, startTab }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s: Settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch {}
}

