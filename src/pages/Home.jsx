import { useState, useEffect } from 'react'
import { useApp } from '../App.jsx'
import { getScores, exportStats, importStats } from '../utils/cookies.js'
import { getTotalQuestionsCount, getWeeks } from '../utils/questionUtils.js'
import { BookOpen, Pencil, Target } from 'lucide-react'

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
  const { user, navigate, useExtra, course } = useApp()
  const weekIds = getWeeks().map(w => w.id)
  const allScores = getScores()
  // Scores are keyed by week id across every course — show only the active one's.
  const scores = Object.fromEntries(
    Object.entries(allScores).filter(([weekId]) => weekIds.includes(weekId))
  )
  const weeksDone = Object.keys(scores).length
  const totalAttempts = Object.values(scores).reduce((s, d) => s + d.attempts, 0)
  const overallAcc = Object.values(scores).reduce((acc, d, _, arr) => {
    return arr.length ? acc + (d.correct / d.total) / arr.length : 0
  }, 0)
  const TOTAL_QUESTIONS = getTotalQuestionsCount(useExtra)

  const [showStats, setShowStats] = useState(false)
  const [exportCode, setExportCode] = useState('')
  const [importCode, setImportCode] = useState('')
  const [importMsg, setImportMsg] = useState(null)
  const [copied, setCopied] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleExport() {
    const code = exportStats()
    setExportCode(code)
  }

  function handleCopy() {
    navigator.clipboard.writeText(exportCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleImport() {
    if (!importCode.trim()) return
    const result = importStats(importCode)
    if (result.ok) {
      setImportMsg({ type: 'ok', text: `Progress restored${result.name ? ` for ${result.name}` : ''}. Reload to refresh stats.` })
      setImportCode('')
      setTimeout(() => window.location.reload(), 1500)
    } else {
      setImportMsg({ type: 'err', text: result.error })
    }
  }

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') { setInstallPrompt(null); setIsInstalled(true) }
  }

  return (
    <div className="page-wide fade-in">
      <div className="home-hero">
        <h1>Hello, <span>{user?.name?.split(' ')[0] || 'Student'}</span></h1>
        <p>Ready to test your {course.short} knowledge? Pick a mode below to get started.</p>
      </div>

      {/* PWA install banner */}
      {installPrompt && !isInstalled && (
        <div className="install-banner">
          <div>
            <strong>Install app</strong>
            <span> — works offline on mobile, no internet needed</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleInstall}>Install</button>
        </div>
      )}

      {totalAttempts > 0 && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{totalAttempts}</div>
            <div className="stat-label">Total attempts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{weeksDone} / {weekIds.length}</div>
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
          <button key={m.id} className="mode-card" onClick={() => navigate(m.id)}>
            <div className="mode-icon">{m.icon}</div>
            <h2>{m.title}</h2>
            <p>{m.desc}</p>
            <span className="mode-badge">{m.badge}</span>
          </button>
        ))}
      </div>

      {/* Export / Import progress */}
      <div className="stats-transfer-section">
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { setShowStats(v => !v); setExportCode(''); setImportMsg(null) }}
        >
          {showStats ? '▲ Hide' : '▼ Transfer progress (export / import)'}
        </button>

        {showStats && (
          <div className="stats-transfer-panel">
            <div className="stats-transfer-col">
              <div className="stats-transfer-label">Export your progress</div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '4px 0 10px' }}>
                Copy this code and save it. Paste it on another device to continue where you left off.
              </p>
              {exportCode ? (
                <>
                  <textarea
                    className="stats-code-box"
                    readOnly
                    value={exportCode}
                    onClick={e => e.target.select()}
                  />
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={handleCopy}>
                    {copied ? '✓ Copied!' : 'Copy to clipboard'}
                  </button>
                </>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={handleExport}>
                  Generate export code
                </button>
              )}
            </div>

            <div className="stats-transfer-col">
              <div className="stats-transfer-label">Import progress</div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '4px 0 10px' }}>
                Paste a previously exported code below to restore your progress.
              </p>
              <textarea
                className="stats-code-box"
                placeholder="Paste SDGv1:… code here"
                value={importCode}
                onChange={e => { setImportCode(e.target.value); setImportMsg(null) }}
              />
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 8 }}
                onClick={handleImport}
                disabled={!importCode.trim()}
              >
                Import progress
              </button>
              {importMsg && (
                <div className={`import-msg ${importMsg.type}`} style={{ marginTop: 8 }}>
                  {importMsg.text}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <a className="made-by" href="https://github.com/mintnchocochip" target="_blank" rel="noreferrer">
        made by mintnchocochip
      </a>
    </div>
  )
}
