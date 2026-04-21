import { useState, useEffect, createContext, useContext } from 'react'
import { getUser, saveUser, clearUser } from './utils/cookies.js'
import Login from './components/Login.jsx'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import StudyMode from './pages/StudyMode.jsx'
import PracticeMode from './pages/PracticeMode.jsx'
import ExamMode from './pages/ExamMode.jsx'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('home')
  const [pageProps, setPageProps] = useState({})
  const [useExtra, setUseExtra] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    const saved = getUser()
    if (saved) setUser(saved)
  }, [])

  function handleLogin(userData) {
    saveUser(userData)
    setUser(userData)
    setPage('home')
  }

  function handleLogout() {
    clearUser()
    setUser(null)
    setPage('home')
  }

  function navigate(to, props = {}) {
    setPage(to)
    setPageProps(props)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }
  
  function toggleExtra() {
    setUseExtra(e => !e)
  }

  const ctx = { user, navigate, pageProps, theme, toggleTheme, useExtra, toggleExtra }

  if (!user) {
    return (
      <AppContext.Provider value={ctx}>
        <Login onLogin={handleLogin} />
      </AppContext.Provider>
    )
  }

  const pages = {
    home: <Home />,
    study: <StudyMode />,
    practice: <PracticeMode />,
    exam: <ExamMode />,
  }

  return (
    <AppContext.Provider value={ctx}>
      <div className="app">
        <Header onLogout={handleLogout} />
        {pages[page] || <Home />}
      </div>
    </AppContext.Provider>
  )
}
