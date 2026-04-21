// Displays a single question with options.
// mode: 'study' = instant reveal on click; 'test' = reveal only when revealed=true
import { Check, X, Minus } from 'lucide-react'
export default function QuestionCard({
  question,
  questionNumber,
  total,
  selectedAnswer,
  onAnswer,
  revealed = false,
  mode = 'test',
}) {
  function handleOption(letter) {
    if (mode === 'study' && revealed) return  // already revealed in study mode
    if (mode === 'test' && revealed) return   // submitted
    onAnswer(letter)
  }

  const isCorrect = selectedAnswer === question.answer
  const showFeedback = revealed && selectedAnswer !== null

  return (
    <div className="question-card">
      {(questionNumber != null && total != null) && (
        <div className="question-meta">
          <span className="question-num">Q{questionNumber} of {total}</span>
          {question.weekLabel && (
            <span className="question-week-tag">{question.weekLabel}</span>
          )}
        </div>
      )}
      <div className="question-text">{question.text}</div>
      <div className="options-list">
        {question.options.map(opt => {
          let cls = 'option-btn'
          if (selectedAnswer === opt.letter) cls += ' selected'
          if (revealed) {
            if (opt.letter === question.answer) cls += ' correct'
            else if (selectedAnswer === opt.letter) cls += ' incorrect'
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

      {showFeedback && (
        <div className={`feedback-box ${isCorrect ? 'correct' : 'incorrect'}`}>
          <span className="feedback-icon mt-1">{isCorrect ? <Check size={18}/> : <X size={18}/>}</span>
          <strong>{isCorrect ? 'Correct!' : `Incorrect. Answer: ${question.answer}. ${question.options.find(o => o.letter === question.answer)?.text}`}</strong>
          {question.feedback && (
            <div className="feedback-detail">{question.feedback}</div>
          )}
        </div>
      )}

      {/* Study mode: show feedback even if no answer yet when revealed */}
      {revealed && selectedAnswer === null && (
        <div className="feedback-box incorrect">
          <span className="feedback-icon mt-1"><Minus size={18}/></span>
          <strong>Not answered. Correct: {question.answer}. {question.options.find(o => o.letter === question.answer)?.text}</strong>
        </div>
      )}
    </div>
  )
}
