import { useState } from 'react'
import { Target } from 'lucide-react'
import { useApp } from '../App.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import Summary from '../components/Summary.jsx'
import { getRandomQuestions, buildResults, getTotalQuestionsCount } from '../utils/questionUtils.js'
import { saveSessionResults } from '../utils/cookies.js'

export default function ExamMode() {
  const { navigate, useExtra } = useApp()
  const TOTAL_QUESTIONS = getTotalQuestionsCount(useExtra)
  const [count, setCount] = useState(20)
  const [questions, setQuestions] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)

  function start() {
    const qs = getRandomQuestions(Math.max(1, Math.min(count, TOTAL_QUESTIONS)), useExtra)
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

  function retry() { start() }

  const answeredCount = Object.keys(answers).length

  // ── Config ──
  if (!questions) {
    return (
      <div className="page fade-in">
        <div className="mode-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('home')}>← Back</button>
          <h1><Target className="inline mr-2" size={28}/> Exam Mode</h1>
          <p>Questions are randomly selected from all 13 weeks. Submit to reveal answers.</p>
        </div>
        <div className="config-card">
          <h3>Number of questions</h3>
          <div className="number-input-row">
            <button
              className="btn btn-secondary"
              onClick={() => setCount(c => Math.max(1, c - 5))}
            >−5</button>
            <input
              className="number-input"
              type="number"
              min={1}
              max={TOTAL_QUESTIONS}
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(TOTAL_QUESTIONS, Number(e.target.value) || 1)))}
            />
            <button
              className="btn btn-secondary"
              onClick={() => setCount(c => Math.min(TOTAL_QUESTIONS, c + 5))}
            >+5</button>
            <span className="number-hint">max {TOTAL_QUESTIONS}</span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[10, 20, 30, 50, TOTAL_QUESTIONS].map(n => (
              <button
                key={n}
                className={`btn btn-sm ${count === n ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCount(n)}
              >
                {n === TOTAL_QUESTIONS ? 'All' : n}
              </button>
            ))}
          </div>
        </div>
        <div className="action-row-end">
          <button className="btn btn-primary btn-lg" onClick={start}>
            Start Exam ({count} questions) →
          </button>
        </div>
      </div>
    )
  }

  // ── Summary ──
  if (submitted) {
    return <Summary results={results} mode="exam" onRetry={retry} />
  }

  // ── Quiz ──
  return (
    <div className="page fade-in">
      <div className="mode-header">
        <button className="btn btn-ghost btn-sm" onClick={() => setQuestions(null)}>← Change count</button>
        <h1><Target className="inline mr-2" size={28}/> Exam Mode</h1>
        <p>{questions.length} questions · Mixed from all weeks</p>
      </div>

      <div className="questions-list">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className={`question-block ${answers[q.id] ? 'answered' : ''}`}
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
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={answeredCount === 0}
        >
          Submit Exam →
        </button>
      </div>
    </div>
  )
}
