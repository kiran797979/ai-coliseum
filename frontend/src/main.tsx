import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const container = document.getElementById('root')

if (!container) {
  // Fallback: create root element if missing
  const fallback = document.createElement('div')
  fallback.id = 'root'
  document.body.appendChild(fallback)
  console.warn('Root element not found, created fallback')
}

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Log startup info in dev
if (import.meta.env.DEV) {
  console.log(
    '%c⚔️ AI Coliseum Frontend Started',
    'color: #8b5cf6; font-size: 14px; font-weight: bold;'
  )
  console.log(
    '%cAPI: %chttp://localhost:3001',
    'color: #6b7280;',
    'color: #06b6d4;'
  )
}