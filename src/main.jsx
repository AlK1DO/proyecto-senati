import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext'
import { FacturasProvider } from './context/FacturasContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FacturasProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </FacturasProvider>
  </StrictMode>,
)
