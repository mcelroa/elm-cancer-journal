import type { Settings } from '../settings'
import type { Tab } from '../types'

const TAB_LABELS: Record<Tab, string> = {
  journal: 'Journal',
  history: 'History',
  trends: 'Trends',
  export: 'Export',
  settings: 'Settings',
}

export function SettingsPanel({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  return (
    <form className="card" onSubmit={(e)=>e.preventDefault()}>
      <h2 style={{marginTop:0}}>Settings</h2>
      <div className="grid">
        <label className="field" style={{alignItems:'flex-start'}}>
          <div className="field-label"><span>Backup reminders</span><em>Show periodic reminder to download JSON backup</em></div>
          <input type="checkbox" checked={settings.remindersEnabled} onChange={e => onChange({ ...settings, remindersEnabled: e.target.checked })} />
        </label>
        <label className="field">
          <div className="field-label"><span>Default start tab</span><em>Applies now and on next start</em></div>
          <select value={settings.startTab} onChange={e => onChange({ ...settings, startTab: e.target.value as Tab })}>
            {(['journal','history','trends','export','settings'] as Tab[]).map(t => (
              <option key={t} value={t}>{TAB_LABELS[t]}</option>
            ))}
          </select>
        </label>
      </div>
    </form>
  )
}
