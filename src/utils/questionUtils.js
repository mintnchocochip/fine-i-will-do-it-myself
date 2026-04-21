import { weeks } from '../data/questions.js'
import extraQuestionsMap from '../data/extraQuestions.json'

export function getWeeks() {
  return weeks.map(w => ({ id: w.id, label: w.label, topic: w.topic }))
}

export function getQuestionsByWeeks(weekIds, useExtra = false) {
  let selected = weeks
    .filter(w => weekIds.includes(w.id))
    .flatMap(w => w.questions.map(q => ({ ...q, weekId: w.id, weekLabel: w.label })))
    
  if (useExtra) {
     weekIds.forEach(wid => {
        const extra = extraQuestionsMap[wid] || []
        const label = weeks.find(w => w.id === wid)?.label || wid
        const mapped = extra.map(q => ({ ...q, weekId: wid, weekLabel: label }))
        selected = selected.concat(mapped)
     })
  }

  return selected
}

export function getAllQuestions(useExtra = false) {
  let all = weeks.flatMap(w => w.questions.map(q => ({ ...q, weekId: w.id, weekLabel: w.label })))
  
  if (useExtra) {
    Object.keys(extraQuestionsMap).forEach(wid => {
       const extra = extraQuestionsMap[wid] || []
       const label = weeks.find(w => w.id === wid)?.label || wid
       const mapped = extra.map(q => ({ ...q, weekId: wid, weekLabel: label }))
       all = all.concat(mapped)
    })
  }
  return all
}

export function getRandomQuestions(count, useExtra = false) {
  const all = getAllQuestions(useExtra)
  const shuffled = [...all].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, all.length))
}

export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

// Build flat results array from user answers map { questionId: letter }
// and the ordered questions array
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
  }))
}

// Group results by week, returns array sorted by accuracy asc
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
