// Displays a single question with options.
// mode: 'study' = instant reveal on click; 'test' = reveal only when revealed=true
// question.multi = select-all-that-apply; the answer is comma-joined sorted letters ('A,C').
import { useEffect, useState } from 'react'
import { Check, X, Minus } from 'lucide-react'
import { formatAnswer } from '../utils/questionUtils.js'

const split = v => (v ? v.split(',') : [])

export default function QuestionCard({
  question,
  questionNumber,
  total,
  selectedAnswer,
  onAnswer,
  revealed = false,
  mode = 'test',
}) {
  const multi = Boolean(question.multi)
  const [draft, setDraft] = useState(() => split(selectedAnswer))

  // StudyMode reuses one card instance for every question, so reset on question change.
  useEffect(() => { setDraft(split(selectedAnswer)) }, [question.id])

  function handleOption(letter) {
    if (revealed) return  // already revealed / submitted
    if (!multi) {
      onAnswer(letter)
      return
    }
    setDraft(d => d.includes(letter) ? d.filter(l => l !== letter) : [...d, letter].sort())
  }

  const correct = split(question.answer)
  const picked = multi && !revealed ? draft : split(selectedAnswer)
  const isCorrect = selectedAnswer === question.answer
  const showFeedback = revealed && selectedAnswer !== null
  const draftDiffers = draft.join(',') !== (selectedAnswer || '')

  const answerSummary = formatAnswer(question.options, question.answer)

  return (
    <div className="question-card">
      {(questionNumber != null && total != null) && (
        <div className="question-meta">
          <span className="question-num">Q{questionNumber} of {total}</span>
          {multi && <span className="question-multi-tag">Select all that apply</span>}
          {question.weekLabel && (
            <span className="question-week-tag">{question.weekLabel}</span>
          )}
        </div>
      )}
      <div className="question-text">{question.text}</div>
      <div className="options-list">
        {question.options.map(opt => {
          let cls = 'option-btn'
          if (picked.includes(opt.letter)) cls += ' selected'
          if (revealed) {
            if (correct.includes(opt.letter)) cls += ' correct'
            else if (picked.includes(opt.letter)) cls += ' incorrect'
          }
          return (
            <button
              key={opt.letter}
              className={cls}
              onClick={() => handleOption(opt.letter)}
              disabled={revealed}
            >
              <span className="option-letter">{opt.letter}</span>
              <span className="option-text">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {multi && !revealed && (
        <div className="action-row">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAnswer(draft.join(','))}
            disabled={!draft.length || !draftDiffers}
          >
            {!draft.length
              ? 'Confirm selection'
              : draftDiffers
                ? `Confirm selection (${draft.length})`
                : `✓ ${draft.length} confirmed`}
          </button>
        </div>
      )}

      {showFeedback && (
        <div className={`feedback-box ${isCorrect ? 'correct' : 'incorrect'}`}>
          <span className="feedback-icon mt-1">{isCorrect ? <Check size={18}/> : <X size={18}/>}</span>
          <strong>{isCorrect ? 'Correct!' : `Incorrect. Answer: ${answerSummary}`}</strong>
          {question.feedback && (
            <div className="feedback-detail">{question.feedback}</div>
          )}
        </div>
      )}

      {/* Study mode: show feedback even if no answer yet when revealed */}
      {revealed && selectedAnswer === null && (
        <div className="feedback-box incorrect">
          <span className="feedback-icon mt-1"><Minus size={18}/></span>
          <strong>Not answered. Correct: {answerSummary}</strong>
        </div>
      )}
    </div>
  )
}
