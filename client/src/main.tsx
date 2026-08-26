import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import "./style.css"

import App from './App.tsx'
import { CartProvider } from "./providers/CartProvider.tsx";
import { AuthProvider } from "./providers/AuthProvider.tsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
