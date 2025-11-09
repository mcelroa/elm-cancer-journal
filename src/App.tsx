import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import type { Entry, Tab } from './types'
import { todayISO } from './types'
import { loadEntries, saveEntries, upsertEntry, deleteEntry } from './storage'
import { JournalForm } from './components/JournalForm'
import { History } from './components/History'
import { Trends } from './components/Trends'
import { Export } from './components/Export'
import { useToast } from './toast'
import { BackupReminder } from './components/BackupReminder'
import { SettingsPanel } from './components/Settings'
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from './settings'

function App() {
  const [tab, setTab] = useState<Tab>('journal')
  const [entries, setEntries] = useState<Entry[]>([])
  const [editing, setEditing] = useState<Entry | undefined>(undefined)
  const [newEntryMode, setNewEntryMode] = useState(false)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const toast = useToast()
  const didInitStartRef = useRef(false)

  useEffect(() => {
    const loaded = loadEntries()
    setEntries(loaded)
    const s = loadSettings()
    setSettings(s)
    setTab(s.startTab)
    setEditing(undefined)
    setNewEntryMode(s.startTab === 'journal')
    didInitStartRef.current = true
  }, [])

  // Persist settings
  useEffect(() => { saveSettings(settings) }, [settings])

  // When user changes default start tab, navigate immediately too
  useEffect(() => {
    if (!didInitStartRef.current) return
    setTab(settings.startTab)
    setEditing(undefined)
    setNewEntryMode(settings.startTab === 'journal')
    toast('Start tab updated', 'info')
  }, [settings.startTab])

  // Normalize title (ensure clean ASCII hyphen)
  useEffect(() => {
    const t = tab[0].toUpperCase() + tab.slice(1)
    document.title = `Cancer Journal - ${t}`
  }, [tab])

  const latestToday = useMemo(() => entries.find(e => e.date === todayISO()), [entries])

  const handleSave = (partial: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const next = upsertEntry(entries, partial)
    setEntries(next)
    saveEntries(next)
    toast('Entry saved', 'success')
  }

  const handleDelete = (id: string) => {
    const next = deleteEntry(entries, id)
    setEntries(next)
    saveEntries(next)
    toast('Entry deleted', 'info')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cancer Journal</h1>
        <nav className="tabs">
          <TabBtn label="Journal" active={tab==='journal'} onClick={() => setTab('journal')} />
          <TabBtn label="History" active={tab==='history'} onClick={() => setTab('history')} />
          <TabBtn label="Trends" active={tab==='trends'} onClick={() => setTab('trends')} />
          <TabBtn label="Export" active={tab==='export'} onClick={() => setTab('export')} />
          <TabBtn label="Settings" active={tab==='settings'} onClick={() => setTab('settings')} />
        </nav>
      </header>
      <main>
        <BackupReminder entries={entries} enabled={settings.remindersEnabled} />
        {tab === 'journal' && (
          <JournalForm
            key={editing ? `edit-${editing.id}` : newEntryMode ? 'new' : 'default'}
            initial={newEntryMode ? undefined : (editing ?? latestToday)}
            onSave={(payload) => { handleSave(payload); setEditing(undefined); setNewEntryMode(false) }}
            onClearEdit={() => { setEditing(undefined); setNewEntryMode(true) }}
          />
        )}

        {tab === 'history' && (
          <History
            entries={entries}
            onDelete={(id) => handleDelete(id)}
            onEdit={(entry) => { setEditing(entry); setNewEntryMode(false); setTab('journal') }}
          />
        )}

        {tab === 'trends' && (
          <Trends entries={entries} />
        )}

        {tab === 'export' && (
          <Export entries={entries} onImport={(next) => { setEntries(next); saveEntries(next); toast('Import complete', 'success') }} />
        )}
        {tab === 'settings' && (
          <SettingsPanel settings={settings} onChange={(s) => setSettings(s)} />
        )}
      </main>
      <footer className="app-footer">Local-first. Your data stays on this device.</footer>
    </div>
  )
}

function TabBtn({ label, active, onClick }: {label: string; active: boolean; onClick: () => void}) {
  return (
    <button className={"tab" + (active ? ' active' : '')} onClick={onClick}>
      {label}
    </button>
  )
}

export default App
