import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { useApp } from '../App.jsx'
import WeekSelector from '../components/WeekSelector.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import Summary from '../components/Summary.jsx'
import { getQuestionsByWeeks, buildResults } from '../utils/questionUtils.js'
import { saveSessionResults } from '../utils/cookies.js'

export default function PracticeMode() {
  const { navigate, pageProps, useExtra } = useApp()
  const [selectedWeeks, setSelectedWeeks] = useState(pageProps?.preselect || [])
  const [questions, setQuestions] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)

  // Apply preselect from navigation (e.g., "Practice Weak Weeks" from Summary)
  useEffect(() => {
    if (pageProps?.preselect) setSelectedWeeks(pageProps.preselect)
  }, [pageProps])

  function start() {
    if (!selectedWeeks.length) return
    const qs = getQuestionsByWeeks(selectedWeeks, useExtra)
    setQuestions(qs)
    setAnswers({})
    setSubmitted(false)
    setResults(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleAnswer(questionId, letter) {
    setAnswers(prev => ({ ...prev, [questionId]: letter }))
  }

  function handleSubmit() {
    const r = buildResults(questions, answers)
    saveSessionResults(r.map(x => ({ weekId: x.weekId, isCorrect: x.isCorrect })))
    setResults(r)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function retry() {
    start()
  }

  const answeredCount = Object.keys(answers).length

  // ── Config ──
  if (!questions) {
    return (
      <div className="page fade-in">
        <div className="mode-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('home')}>← Back</button>
          <h1><Pencil className="inline mr-2" size={28}/> Practice Mode</h1>
          <p>Select one or more weeks. Answer all questions, then submit to see your results.</p>
        </div>
        <div className="config-card">
          <h3>Choose weeks to practise</h3>
          <WeekSelector selected={selectedWeeks} onChange={setSelectedWeeks} multi={true} />
        </div>
        <div className="action-row-end">
          <button
            className="btn btn-primary btn-lg"
            onClick={start}
            disabled={!selectedWeeks.length}
          >
            Start Practice ({selectedWeeks.length} week{selectedWeeks.length !== 1 ? 's' : ''}) →
          </button>
        </div>
      </div>
    )
  }

  // ── Summary ──
  if (submitted) {
    return <Summary results={results} mode="practice" onRetry={retry} />
  }

  // ── Quiz ──
  return (
    <div className="page fade-in">
      <div className="mode-header">
        <button className="btn btn-ghost btn-sm" onClick={() => setQuestions(null)}>← Change weeks</button>
        <h1><Pencil className="inline mr-2" size={28}/> Practice Mode</h1>
        <p>{questions.length} questions · Answer all, then submit</p>
      </div>

      <div className="questions-list">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className={`question-block ${answers[q.id] ? 'answered' : ''}`}
            id={`q-${idx}`}
          >
            <QuestionCard
              question={q}
              questionNumber={idx + 1}
              total={questions.length}
              selectedAnswer={answers[q.id] || null}
              onAnswer={letter => handleAnswer(q.id, letter)}
              revealed={false}
              mode="test"
            />
          </div>
        ))}
      </div>

      <div style={{ height: 80 }} />

      <div className="sticky-submit">
        <div className="answered-count">
          <span>{answeredCount}</span> / {questions.length} answered
          {answeredCount < questions.length && (
            <span style={{ color: 'var(--text-dim)', marginLeft: 8 }}>
              ({questions.length - answeredCount} remaining)
            </span>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={answeredCount === 0}
        >
          Submit & See Results →
        </button>
      </div>
    </div>
  )
}
