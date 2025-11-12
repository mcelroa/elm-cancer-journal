import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider, ToastHost } from './toast'
import { ConfirmProvider, ConfirmDialog } from './confirm'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <App />
        <ToastHost />
        <ConfirmDialog />
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>,
)

// Ensure no service worker remains registered (we are not a PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations?.()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {})
}
