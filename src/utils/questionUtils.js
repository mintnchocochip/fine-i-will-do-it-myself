import { getActiveCourse } from '../data/courses.js'
import { getSeenQuestionIds, getWrongQuestionIds } from './cookies.js'

export function getWeeks() {
  return getActiveCourse().weeks.map(w => ({ id: w.id, label: w.label, topic: w.topic }))
}

export function getQuestionsByWeeks(weekIds, useExtra = false) {
  const { weeks, extraMap } = getActiveCourse()
  let selected = weeks
    .filter(w => weekIds.includes(w.id))
    .flatMap(w => w.questions.map(q => ({ ...q, weekId: w.id, weekLabel: w.label })))

  if (useExtra) {
    weekIds.forEach(wid => {
      const extra = extraMap[wid] || []
      const label = weeks.find(w => w.id === wid)?.label || wid
      selected = selected.concat(extra.map(q => ({ ...q, weekId: wid, weekLabel: label })))
    })
  }
  return selected
}

export function getAllQuestions(useExtra = false) {
  const { weeks, extraMap } = getActiveCourse()
  let all = weeks.flatMap(w => w.questions.map(q => ({ ...q, weekId: w.id, weekLabel: w.label })))

  if (useExtra) {
    weeks.forEach(({ id: wid }) => {
      const extra = extraMap[wid] || []
      const label = weeks.find(w => w.id === wid)?.label || wid
      all = all.concat(extra.map(q => ({ ...q, weekId: wid, weekLabel: label })))
    })
  }
  return all
}

export function getRandomQuestions(count, useExtra = false) {
  const all = getAllQuestions(useExtra)
  const shuffled = [...all].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, all.length))
}

export function getUnseenQuestions(useExtra = false) {
  const seen = new Set(getSeenQuestionIds())
  return getAllQuestions(useExtra).filter(q => !seen.has(q.id))
}

export function getWrongQuestions(useExtra = false) {
  const wrongIds = new Set(getWrongQuestionIds())
  if (wrongIds.size === 0) return []
  return getAllQuestions(useExtra).filter(q => wrongIds.has(q.id))
}

// Renders a stored answer ('C' or 'A,C') as "C. option text", multi answers joined.
export function formatAnswer(options, answer) {
  if (!answer) return ''
  return answer
    .split(',')
    .map(l => `${l}. ${options.find(o => o.letter === l)?.text ?? ''}`)
    .join('  |  ')
}

// 'week3' and 'ie-week3' both read as 'Week 3'.
export function formatWeekId(weekId) {
  return weekId.replace(/^.*week/, 'Week ')
}

export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function buildResults(questions, answers) {
  return questions.map(q => ({
    weekId: q.weekId,
    weekLabel: q.weekLabel,
    questionId: q.id,
    questionText: q.text,
    options: q.options,
    correctAnswer: q.answer,
    userAnswer: answers[q.id] || null,
    isCorrect: answers[q.id] === q.answer,
    feedback: q.feedback,
    isNew: q._isNew || false,
  }))
}

export function groupResultsByWeek(results) {
  const map = {}
  results.forEach(r => {
    if (!map[r.weekId]) map[r.weekId] = { weekId: r.weekId, weekLabel: r.weekLabel, correct: 0, total: 0 }
    map[r.weekId].total++
    if (r.isCorrect) map[r.weekId].correct++
  })
  return Object.values(map)
    .map(w => ({ ...w, accuracy: w.correct / w.total }))
    .sort((a, b) => a.accuracy - b.accuracy)
}

export function getTotalQuestionsCount(useExtra = false) {
  return getAllQuestions(useExtra).length
}
