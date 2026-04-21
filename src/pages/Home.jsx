import { useApp } from '../App.jsx'
import { getScores } from '../utils/cookies.js'
import { getTotalQuestionsCount } from '../utils/questionUtils.js'
import { BookOpen, Pencil, Target, Bot } from 'lucide-react'

const MODES = [
  {
    id: 'study',
    icon: <BookOpen size={28} />,
    title: 'Study Mode',
    desc: 'Select a week and practise all its questions. Answers are revealed immediately after each selection.',
    badge: 'Instant feedback'
  },
  {
    id: 'practice',
    icon: <Pencil size={28} />,
    title: 'Practice Mode',
    desc: 'Select one or more weeks. Answer all questions, then submit to see how you did.',
    badge: 'Answers on submit'
  },
  {
    id: 'exam',
    icon: <Target size={28} />,
    title: 'Exam Mode',
    desc: 'Enter a custom number of questions randomly drawn from all weeks — simulates a real exam.',
    badge: 'Random questions'
  },
]

export default function Home() {
  const { user, navigate, useExtra } = useApp()
  const scores = getScores()
  const weeksDone = Object.keys(scores).length
  const totalAttempts = Object.values(scores).reduce((s, d) => s + d.attempts, 0)
  const overallAcc = Object.values(scores).reduce((acc, d, _, arr) => {
    return arr.length ? acc + (d.correct / d.total) / arr.length : 0
  }, 0)
  const TOTAL_QUESTIONS = getTotalQuestionsCount(useExtra)

  return (
    <div className="page-wide fade-in">
      <div className="home-hero">
        <h1>Hello, <span>{user?.name?.split(' ')[0] || 'Student'}</span></h1>
        <p>Ready to test your SDG knowledge? Pick a mode below to get started.</p>
      </div>

      {totalAttempts > 0 && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{totalAttempts}</div>
            <div className="stat-label">Total attempts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{weeksDone} / 13</div>
            <div className="stat-label">Weeks practised</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(overallAcc * 100)}%</div>
            <div className="stat-label">Overall accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{TOTAL_QUESTIONS}</div>
            <div className="stat-label">Total questions</div>
          </div>
        </div>
      )}

      <div className="mode-grid">
        {MODES.map(m => (
          <button
            key={m.id}
            className="mode-card"
            onClick={() => navigate(m.id)}
          >
            <div className="mode-icon">{m.icon}</div>
            <h2>{m.title}</h2>
            <p>{m.desc}</p>
            <span className="mode-badge">{m.badge}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
