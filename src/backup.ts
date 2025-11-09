export const BACKUP_KEY = 'cancerJournal.v1.lastBackupAt'

export const getLastBackup = (): string | null => {
  try { return localStorage.getItem(BACKUP_KEY) } catch { return null }
}

export const markBackup = () => {
  try { localStorage.setItem(BACKUP_KEY, new Date().toISOString()) } catch {}
}

export const daysSinceBackup = (): number | null => {
  const iso = getLastBackup()
  if (!iso) return null
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return null
  const ms = Date.now() - then
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

