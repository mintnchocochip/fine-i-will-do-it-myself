import { useState } from 'react'
import { Globe } from 'lucide-react'

export default function Login({ onLogin }) {
  const [name, setName] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (!name.trim()) return
    onLogin({
      name: name.trim(),
      email: `${name.trim().toLowerCase().replace(/\s+/g, '.')}@student.local`,
      picture: null,
    })
  }

  return (
    <div className="login-screen fade-in">
      <div className="login-card">
        <div className="login-logo"><Globe size={32} /></div>
        <h1>Swotter</h1>
        <p>Practise your course assignments, week by week</p>

        <form className="demo-form" onSubmit={handleLogin} style={{ marginTop: 24 }}>
          <input
            className="input"
            type="text"
            placeholder="Enter your name to continue…"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <button
            className="btn btn-primary btn-full"
            type="submit"
            disabled={!name.trim()}
            style={{ marginTop: 16 }}
          >
            Continue →
          </button>
        </form>
      </div>

      <a className="made-by" href="https://github.com/mintnchocochip" target="_blank" rel="noreferrer">
        made by mintnchocochip
      </a>
    </div>
  )
}
