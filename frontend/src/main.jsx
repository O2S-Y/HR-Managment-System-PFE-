import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AppRoutes } from './routes/AppRoutes'
import { ThemeProvider } from './theme/ThemeProvider'
import { NotificationsProvider } from './notifications/NotificationsProvider'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster position="top-right" />
    <BrowserRouter>
      <ThemeProvider>
        <NotificationsProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
