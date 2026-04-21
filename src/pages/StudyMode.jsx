import { useState } from 'react'
import { useApp } from '../App.jsx'
import { BookOpen } from 'lucide-react'
import WeekSelector from '../components/WeekSelector.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import Summary from '../components/Summary.jsx'
import { getQuestionsByWeeks, buildResults } from '../utils/questionUtils.js'
import { saveSessionResults } from '../utils/cookies.js'

export default function StudyMode() {
  const { navigate, useExtra } = useApp()
  const [selectedWeeks, setSelectedWeeks] = useState([])
  const [questions, setQuestions] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})  // { questionId: letter }
  const [revealed, setRevealed] = useState({}) // { questionId: true }
  const [done, setDone] = useState(false)
  const [results, setResults] = useState(null)

  function start() {
    if (!selectedWeeks.length) return
    const qs = getQuestionsByWeeks(selectedWeeks, useExtra)
    setQuestions(qs)
    setCurrentIdx(0)
    setAnswers({})
    setRevealed({})
    setDone(false)
    setResults(null)
  }

  function handleAnswer(letter) {
    const q = questions[currentIdx]
    const newAnswers = { ...answers, [q.id]: letter }
    const newRevealed = { ...revealed, [q.id]: true }
    setAnswers(newAnswers)
    setRevealed(newRevealed)
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      finish()
    }
  }

  function handleSkip() {
    // Mark as revealed without an answer so feedback shows
    const q = questions[currentIdx]
    setRevealed(prev => ({ ...prev, [q.id]: true }))
  }

  function finish() {
    const r = buildResults(questions, answers)
    saveSessionResults(r.map(x => ({ weekId: x.weekId, isCorrect: x.isCorrect })))
    setResults(r)
    setDone(true)
  }

  function retry() {
    start()
  }

  // ── Config screen ──
  if (!questions) {
    return (
      <div className="page fade-in">
        <div className="mode-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('home')}>← Back</button>
          <h1><BookOpen className="inline mr-2" size={28}/> Study Mode</h1>
          <p>Select a week to study. Answers are shown immediately after each choice.</p>
        </div>
        <div className="config-card">
          <h3>Choose a week</h3>
          <WeekSelector selected={selectedWeeks} onChange={setSelectedWeeks} multi={false} />
        </div>
        <div className="action-row-end">
          <button
            className="btn btn-primary btn-lg"
            onClick={start}
            disabled={!selectedWeeks.length}
          >
            Start Studying →
          </button>
        </div>
      </div>
    )
  }

  // ── Summary screen ──
  if (done) {
    return <Summary results={results} mode="study" onRetry={retry} />
  }

  // ── Quiz screen ──
  const q = questions[currentIdx]
  const isRevealed = Boolean(revealed[q.id])
  const hasAnswer = Boolean(answers[q.id])

  return (
    <div className="page fade-in">
      <div className="mode-header">
        <button className="btn btn-ghost btn-sm" onClick={() => { setQuestions(null) }}>← Change week</button>
      </div>
      <ProgressBar current={currentIdx + 1} total={questions.length} />

      <div className="card">
        <QuestionCard
          question={q}
          questionNumber={currentIdx + 1}
          total={questions.length}
          selectedAnswer={answers[q.id] || null}
          onAnswer={handleAnswer}
          revealed={isRevealed}
          mode="study"
        />

        <div className="action-row">
          {!isRevealed && (
            <button className="btn btn-ghost" onClick={handleSkip}>
              Skip (show answer)
            </button>
          )}
          {isRevealed && (
            <button className="btn btn-primary" onClick={handleNext}>
              {currentIdx < questions.length - 1 ? 'Next Question →' : 'Finish & See Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
