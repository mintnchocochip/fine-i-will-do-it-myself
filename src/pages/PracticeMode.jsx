import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { useApp } from '../App.jsx'
import WeekSelector from '../components/WeekSelector.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import Summary from '../components/Summary.jsx'
import { getQuestionsByWeeks, buildResults, getWrongQuestions, shuffle } from '../utils/questionUtils.js'
import { saveSessionResults, markQuestionsSeen, trackWrongAnswers } from '../utils/cookies.js'

export default function PracticeMode() {
  const { navigate, pageProps, useExtra } = useApp()
  const [selectedWeeks, setSelectedWeeks] = useState(pageProps?.preselect || [])
  const [wrongMode, setWrongMode] = useState(pageProps?.wrongMode || false)
  const [questions, setQuestions] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)

  const wrongCount = getWrongQuestions(useExtra).length

  useEffect(() => {
    if (pageProps?.preselect) setSelectedWeeks(pageProps.preselect)
    if (pageProps?.wrongMode) setWrongMode(true)
  }, [pageProps])

  function start() {
    let qs
    if (wrongMode) {
      qs = shuffle(getWrongQuestions(useExtra))
    } else {
      if (!selectedWeeks.length) return
      qs = getQuestionsByWeeks(selectedWeeks, useExtra)
    }
    markQuestionsSeen(qs.map(q => q.id))
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
    trackWrongAnswers(r)
    setResults(r)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function retry() { start() }

  const answeredCount = Object.keys(answers).length

  // ── Config ──
  if (!questions) {
    const canStart = wrongMode ? wrongCount > 0 : selectedWeeks.length > 0

    return (
      <div className="page fade-in">
        <div className="mode-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('home')}>← Back</button>
          <h1><Pencil className="inline mr-2" size={28}/> Practice Mode</h1>
          <p>Select one or more weeks, or drill your previously wrong answers.</p>
        </div>

        {/* Wrong questions card */}
        <div
          className={`config-card wrong-mode-card ${wrongMode ? 'wrong-mode-active' : ''}`}
          style={{ marginBottom: 16, cursor: 'pointer' }}
          onClick={() => { setWrongMode(true); setSelectedWeeks([]) }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                Drill wrong answers
                {wrongCount > 0 && (
                  <span className="wrong-count-badge">{wrongCount}</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                {wrongCount > 0
                  ? `Practice the ${wrongCount} question${wrongCount !== 1 ? 's' : ''} you've previously answered incorrectly`
                  : 'No wrong answers recorded yet — attempt a quiz first'}
              </div>
            </div>
            <div className={`mode-radio ${wrongMode ? 'selected' : ''}`} />
          </div>
        </div>

        {/* Week selector card */}
        <div
          className={`config-card ${!wrongMode ? 'week-mode-active' : ''}`}
          style={{ cursor: 'pointer' }}
          onClick={() => setWrongMode(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Choose weeks to practise</h3>
            <div className={`mode-radio ${!wrongMode ? 'selected' : ''}`} />
          </div>
          {!wrongMode && (
            <WeekSelector selected={selectedWeeks} onChange={setSelectedWeeks} multi={true} />
          )}
          {wrongMode && (
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Click to switch to week selection</div>
          )}
        </div>

        <div className="action-row-end">
          <button
            className="btn btn-primary btn-lg"
            onClick={start}
            disabled={!canStart}
          >
            {wrongMode
              ? `Drill Wrong Answers (${wrongCount}) →`
              : `Start Practice (${selectedWeeks.length} week${selectedWeeks.length !== 1 ? 's' : ''}) →`}
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
        <button className="btn btn-ghost btn-sm" onClick={() => setQuestions(null)}>← Change</button>
        <h1><Pencil className="inline mr-2" size={28}/> Practice Mode</h1>
        <p>
          {questions.length} questions ·{' '}
          {wrongMode ? 'Drilling your wrong answers' : 'Answer all, then submit'}
        </p>
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
