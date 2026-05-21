import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import en from './locales/en'
import zh from './locales/zh'

const LANG_KEY = 'hciDiaryStudyLang'
const locales = { en, zh }

const LanguageContext = createContext(null)

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

function interpolate(str, vars = {}) {
  if (!str || typeof str !== 'string') return str
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`
  )
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(LANG_KEY)
    return saved === 'zh' || saved === 'en' ? saved : 'en'
  })

  const setLang = useCallback((next) => {
    setLangState(next)
    localStorage.setItem(LANG_KEY, next)
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
  }, [])

  const t = useCallback(
    (key, vars) => {
      const messages = locales[lang] || locales.en
      const value = getNested(messages, key) ?? getNested(locales.en, key)
      if (typeof value === 'string') return interpolate(value, vars)
      return key
    },
    [lang]
  )

  const tOption = useCallback(
    (category, value) => {
      if (!value) return value
      const key = `options.${category}.${value}`
      const translated = t(key)
      return translated === key ? value : translated
    },
    [t]
  )

  const value = useMemo(
    () => ({ lang, setLang, t, tOption, locale: lang === 'zh' ? 'zh-CN' : 'en-US' }),
    [lang, setLang, t, tOption]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider')
  return ctx
}
