import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'
import './ThemeSwitcher.css'

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('light')
  const [showDropdown, setShowDropdown] = useState(false)

  const themes = [
    { id: 'light', name: 'Light', icon: Sun, colors: { primary: '#3b82f6', bg: '#ffffff' } },
    { id: 'dark', name: 'Dark', icon: Moon, colors: { primary: '#60a5fa', bg: '#1f2937' } },
    { id: 'sepia', name: 'Sepia', icon: Palette, colors: { primary: '#d97706', bg: '#fef7ed' } },
    { id: 'system', name: 'System', icon: Monitor, colors: { primary: '#6366f1', bg: 'auto' } }
  ]

  useEffect(() => {
    // Load saved theme or detect system preference
    const savedTheme = localStorage.getItem('app-theme')
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setCurrentTheme('system')
      applyTheme(systemTheme)
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e) => {
      if (currentTheme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [currentTheme])

  const applyTheme = (themeId) => {
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-sepia')
    
    // Apply new theme
    switch (themeId) {
      case 'dark':
        root.classList.add('theme-dark')
        break
      case 'sepia':
        root.classList.add('theme-sepia')
        break
      case 'system':
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.add(systemIsDark ? 'theme-dark' : 'theme-light')
        break
      default:
        root.classList.add('theme-light')
    }
  }

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId)
    localStorage.setItem('app-theme', themeId)
    
    if (themeId === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      applyTheme(systemTheme)
    } else {
      applyTheme(themeId)
    }
    
    setShowDropdown(false)
  }

  const getCurrentThemeData = () => {
    return themes.find(theme => theme.id === currentTheme) || themes[0]
  }

  const currentThemeData = getCurrentThemeData()
  const IconComponent = currentThemeData.icon

  return (
    <div className="theme-switcher">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="theme-toggle-btn"
        title="Switch theme"
      >
        <IconComponent size={16} />
      </button>
      
      {showDropdown && (
        <>
          <div 
            className="theme-dropdown-overlay" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="theme-dropdown">
            {themes.map((theme) => {
              const ThemeIcon = theme.icon
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                >
                  <ThemeIcon size={14} />
                  <span>{theme.name}</span>
                  {currentTheme === theme.id && (
                    <div className="active-indicator" />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeSwitcher
