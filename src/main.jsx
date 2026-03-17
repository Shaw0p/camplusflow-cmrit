import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: '#1e1e2e',
                    color: '#f0f0ff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.875rem',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                },
                success: {
                    iconTheme: { primary: '#34d399', secondary: '#0a0a0f' },
                },
                error: {
                    iconTheme: { primary: '#f87171', secondary: '#0a0a0f' },
                },
            }}
        />
    </StrictMode>,
)
