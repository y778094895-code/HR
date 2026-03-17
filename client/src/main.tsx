import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import '@/index.css'
import { Toaster } from '@/components/ui/overlays/toaster'
import { TooltipProvider } from '@/components/ui/overlays/tooltip'

import { AuthProvider } from '@/contexts/AuthContext'
import { AppearanceProvider } from '@/contexts/AppearanceContext'
import '@/lib/i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppearanceProvider>
            <AuthProvider>
                <TooltipProvider>
                    <App />
                    <Toaster />
                </TooltipProvider>
            </AuthProvider>
        </AppearanceProvider>
    </React.StrictMode>,
)
