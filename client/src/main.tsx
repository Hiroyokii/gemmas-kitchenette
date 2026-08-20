import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "./contexts/AuthProvider.tsx";

import "./style.css"

import App from './App.tsx'
import { CartProvider } from "./contexts/CartProvider";

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <CartProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </CartProvider>
  </AuthProvider>,
)
