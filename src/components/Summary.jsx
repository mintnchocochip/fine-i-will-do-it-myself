import { useEffect, useState } from 'react'
import { useApp } from '../App.jsx'
import { groupResultsByWeek, getWeeks, formatAnswer, formatWeekId } from '../utils/questionUtils.js'
import { getScores } from '../utils/cookies.js'
import { Trophy, PartyPopper, ThumbsUp, BookOpen, AlertTriangle } from 'lucide-react'

function ScoreCircle({ pct }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const [dash, setDash] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => setDash(circ * (1 - pct / 100)), 100)
    return () => clearTimeout(t)
  }, [pct, circ])

  const color = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div className="score-circle">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--surface)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="score-circle-text">
        <span className="score-circle-pct" style={{ color }}>{pct}%</span>
        <span className="score-circle-label">Score</span>
      </div>
    </div>
  )
}

export default function Summary({ results, mode, onRetry, newCount }) {
  const { navigate } = useApp()
  const correct = results.filter(r => r.isCorrect).length
  const total = results.length
  const pct = Math.round((correct / total) * 100)
  const byWeek = groupResultsByWeek(results)
  const historicalScores = getScores()

  const outOf100 = pct
  const outOf75 = Math.round((correct / total) * 75)

  const message =
    pct === 100 ? <div className="flex items-center justify-center gap-2"><Trophy size={28}/> Perfect score!</div> :
    pct >= 80  ? <div className="flex items-center justify-center gap-2"><PartyPopper size={28}/> Excellent work!</div> :
    pct >= 60  ? <div className="flex items-center justify-center gap-2"><ThumbsUp size={28}/> Good effort!</div> :
    <div className="flex items-center justify-center gap-2"><BookOpen size={28}/> Keep studying!</div>

  function barColor(acc) {
    return acc >= 0.7 ? 'var(--green)' : acc >= 0.5 ? 'var(--yellow)' : 'var(--red)'
  }

  const weakWeeks = byWeek.filter(w => w.accuracy < 0.7)

  // Scores span every course; the table only covers the one being practised.
  const courseWeekIds = getWeeks().map(w => w.id)
  const historicalEntries = Object.entries(historicalScores)
    .filter(([weekId]) => courseWeekIds.includes(weekId))
    .map(([weekId, d]) => ({
      weekId,
      weekLabel: formatWeekId(weekId),
      accuracy: d.correct / d.total,
      attempts: d.attempts,
      correct: d.correct,
      total: d.total,
    }))

  return (
    <div className="page fade-in">
      <div className="summary-header">
        <ScoreCircle pct={pct} />
        <h2>{message}</h2>
        <p>{correct} / {total} correct answers</p>

        {mode === 'exam' && (
          <div className="exam-score-row">
            <div className="exam-score-chip">
              <span className="exam-score-num" style={{ color: pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)' }}>
                {outOf100}
              </span>
              <span className="exam-score-denom">/ 100</span>
              <span className="exam-score-label">marks</span>
            </div>
            <div className="exam-score-divider">→</div>
            <div className="exam-score-chip">
              <span className="exam-score-num" style={{ color: outOf75 >= 60 ? 'var(--green)' : outOf75 >= 45 ? 'var(--yellow)' : 'var(--red)' }}>
                {outOf75}
              </span>
              <span className="exam-score-denom">/ 75</span>
              <span className="exam-score-label">marks</span>
            </div>
          </div>
        )}

        {newCount > 0 && (
          <div className="new-badge-summary">{newCount} new question{newCount !== 1 ? 's' : ''} included</div>
        )}
      </div>

      {/* Week breakdown */}
      {byWeek.length > 1 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title">Week Breakdown</div>
          <div className="week-breakdown">
            {byWeek.map(w => (
              <div
                key={w.weekId}
                className={`week-row ${w.accuracy < 0.6 ? 'weak' : w.accuracy >= 0.9 ? 'great' : ''}`}
              >
                <span className="week-row-label">{w.weekLabel}</span>
                <div className="mini-bar">
                  <div
                    className="mini-bar-fill"
                    style={{ width: `${Math.round(w.accuracy * 100)}%`, background: barColor(w.accuracy) }}
                  />
                </div>
                <span className="week-row-score">{w.correct}/{w.total}</span>
                {w.accuracy < 0.6 && (
                  <span className="weak-label" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>Weak</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak weeks recommendation */}
      {weakWeeks.length > 0 && (
        <div className="alert alert-warn" style={{ marginBottom: 16 }}>
          <span><AlertTriangle size={20} /></span>
          <div>
            <strong>Focus areas:</strong>{' '}
            {weakWeeks.map(w => w.weekLabel).join(', ')}. Consider re-studying these weeks.
          </div>
        </div>
      )}

      {/* Historical performance */}
      {historicalEntries.length > 0 && (
        <div className="card" style={{ marginBottom: 16, overflowX: 'auto' }}>
          <div className="section-title">All-Time Performance</div>
          <table className="performance-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Score</th>
                <th>Correct</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {historicalEntries.map(w => (
                <tr key={w.weekId}>
                  <td className="font-medium">{w.weekLabel}</td>
                  <td style={{ color: barColor(w.accuracy), fontWeight: 600 }}>
                    {Math.round(w.accuracy * 100)}%
                  </td>
                  <td className="text-muted">{w.correct} / {w.total}</td>
                  <td className="text-muted">{w.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review wrong answers */}
      {results.filter(r => !r.isCorrect).length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title">Incorrect Answers ({results.filter(r => !r.isCorrect).length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.filter(r => !r.isCorrect).map(r => (
              <div key={r.questionId} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  {r.isNew && <span className="new-badge-inline">New</span>}
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.questionText}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--red)' }}>
                  Your answer: {r.userAnswer ? formatAnswer(r.options, r.userAnswer) : 'Not answered'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--green)', marginTop: 2 }}>
                  Correct: {formatAnswer(r.options, r.correctAnswer)}
                </div>
                {r.feedback && (
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{r.feedback}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="action-row">
        <button className="btn btn-secondary" onClick={() => navigate('home')}>
          ← Home
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          {onRetry && (
            <button className="btn btn-secondary" onClick={onRetry}>
              Retry
            </button>
          )}
          {weakWeeks.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('practice', { preselect: weakWeeks.map(w => w.weekId) })}
            >
              Practice Weak Weeks →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
