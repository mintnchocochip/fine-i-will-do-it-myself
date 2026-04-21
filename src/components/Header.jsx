import { useApp } from '../App.jsx'
import { Globe, Sun, Moon, Brain } from 'lucide-react'

export default function Header({ onLogout }) {
  const { user, navigate, theme, toggleTheme, useExtra, toggleExtra } = useApp()

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header className="header">
      <div className="header-inner">
        <button className="header-logo btn-ghost" onClick={() => navigate('home')}>
          <div className="header-logo-icon"><Globe size={20} /></div>
          <span>Education for Sustainable Development</span>
        </button>

        <div className="header-right">
          <button 
            className={`btn-icon ${useExtra ? 'text-accent bg-accent/10' : 'btn-ghost'}`} 
            onClick={toggleExtra} 
            aria-label="Toggle extra AI questions"
            title={useExtra ? "Pre-generated extra questions ON" : "Pre-generated extra questions OFF"}
          >
            <Brain size={18} />
          </button>
          
          <button className="btn-icon btn-ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="header-user">
            <div className="user-avatar">
              {user?.picture
                ? <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
                : initials
              }
            </div>
            <span className="user-name">{user?.name}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
