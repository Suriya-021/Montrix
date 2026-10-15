import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
)

// Register PWA service worker for offline support and speed
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
