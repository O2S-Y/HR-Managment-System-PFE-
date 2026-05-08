import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'newdevrh_theme'

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => 'light')

  useEffect(() => {
    const t = getPreferredTheme()
    setTheme(t)
    applyTheme(t)
  }, [])

  const value = useMemo(() => {
    return {
      theme,
      setTheme: (t) => {
        setTheme(t)
        localStorage.setItem(THEME_KEY, t)
        applyTheme(t)
      },
      toggle: () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        localStorage.setItem(THEME_KEY, next)
        applyTheme(next)
      },
    }
  }, [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

