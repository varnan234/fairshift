import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GlassFilterDefs } from './components/ui/liquid-glass-button.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Global SVG filter — renders once, referenced everywhere via url(#liquid-glass-filter) */}
    <GlassFilterDefs />
    <App />
  </StrictMode>,
)
