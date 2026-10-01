import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </SettingsProvider>
  </StrictMode>,
)
