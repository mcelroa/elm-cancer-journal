import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type ConfirmState = {
  open: boolean
  message: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
  resolve?: (ok: boolean) => void
}

type ConfirmContextValue = {
  confirm: (opts: { message: string; confirmText?: string; cancelText?: string; destructive?: boolean }) => Promise<boolean>
  state: ConfirmState
  setOpen: (open: boolean) => void
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>({ open: false, message: '' })

  const setOpen = useCallback((open: boolean) => setState(s => ({ ...s, open })), [])

  const confirm = useCallback((opts: { message: string; confirmText?: string; cancelText?: string; destructive?: boolean }) => {
    return new Promise<boolean>(resolve => {
      setState({ open: true, message: opts.message, confirmText: opts.confirmText, cancelText: opts.cancelText, destructive: opts.destructive, resolve })
    })
  }, [])

  const value = useMemo(() => ({ confirm, state, setOpen }), [confirm, state])

  return (
    <ConfirmContext.Provider value={value}>{children}</ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) return async () => false
  return ctx.confirm
}

export function ConfirmDialog() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) return null
  const { state, setOpen } = ctx
  if (!state.open) return null
  const onClose = (ok: boolean) => {
    setOpen(false)
    state.resolve?.(ok)
  }
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-body">{state.message}</div>
        <div className="modal-actions">
          <button className="tab" onClick={() => onClose(false)}>{state.cancelText ?? 'Cancel'}</button>
          <button className={state.destructive ? 'danger' : 'primary'} onClick={() => onClose(true)}>{state.confirmText ?? 'OK'}</button>
        </div>
      </div>
    </div>
  )
}
