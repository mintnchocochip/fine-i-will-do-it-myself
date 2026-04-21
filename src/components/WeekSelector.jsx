import { getWeeks } from '../utils/questionUtils.js'
import { getWeekAccuracy } from '../utils/cookies.js'

export default function WeekSelector({ selected, onChange, multi = true }) {
  const weeks = getWeeks()

  function toggle(id) {
    if (!multi) {
      onChange([id])
      return
    }
    if (selected.includes(id)) {
      onChange(selected.filter(w => w !== id))
    } else {
      onChange([...selected, id])
    }
  }

  function selectAll() { onChange(weeks.map(w => w.id)) }
  function clearAll()  { onChange([]) }

  return (
    <div>
      {multi && (
        <div className="select-all-row">
          <button className="btn btn-secondary btn-sm" onClick={selectAll}>Select All</button>
          <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear</button>
          <span>{selected.length} / {weeks.length} selected</span>
        </div>
      )}
      <div className="week-selector-grid">
        {weeks.map(w => {
          const acc = getWeekAccuracy(w.id)
          const dotColor = acc === null ? 'var(--text-dim)' : acc >= 0.7 ? 'var(--green)' : 'var(--red)'
          return (
            <button
              key={w.id}
              className={`week-chip ${selected.includes(w.id) ? 'selected' : ''}`}
              onClick={() => toggle(w.id)}
            >
              <div className="week-chip-label">
                {acc !== null && (
                  <span className="accuracy-dot" style={{ background: dotColor }} />
                )}
                {w.label}
              </div>
              <div className="week-chip-topic">{w.topic}</div>
              {acc !== null && (
                <div style={{ fontSize: 11, marginTop: 4, color: dotColor }}>
                  {Math.round(acc * 100)}% accuracy
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
