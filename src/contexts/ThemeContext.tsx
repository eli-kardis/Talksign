'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme?: () => void // 더 이상 테마 토글 기능 없음
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('dark') // 항상 다크 모드
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      // 로컬스토리지에서 기존 테마 설정 제거
      localStorage.removeItem('theme')
    } catch (error) {
      console.warn('Failed to access localStorage:', error)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    try {
      // 항상 다크 모드 클래스 제거 (CSS에서 기본이 다크이므로)
      const root = document.documentElement
      root.classList.remove('dark')
    } catch (error) {
      console.warn('Failed to set theme:', error)
    }
  }, [mounted])

  // 초기 mount 전에는 다크 테마로 렌더링
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'dark' }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}