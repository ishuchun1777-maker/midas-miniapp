import React, { createContext, useContext, useState, useEffect } from 'react'
import { texts } from './texts'

type Language = 'uz' | 'en'

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: keyof typeof texts.uz) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('midas_lang') as Language) || 'uz'
  })

  useEffect(() => {
    localStorage.setItem('midas_lang', lang)
  }, [lang])

  const t = (key: keyof typeof texts.uz) => texts[lang][key] || key

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
