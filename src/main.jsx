import React from 'react'
import ReactDOM from 'react-dom/client'
import { LanguageProvider } from './i18n/LanguageContext'
import App from './App'
import './styles.css'

document.documentElement.lang =
  localStorage.getItem('hciDiaryStudyLang') === 'zh' ? 'zh-CN' : 'en'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
)
