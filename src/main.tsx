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

// Register service worker (in production builds)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed', err)
    })
  })
}
