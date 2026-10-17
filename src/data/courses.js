// Course registry. Every course exposes the same week shape the quiz pages consume:
//   { id, label, topic, questions: [{ id, text, options: [{ letter, text }], answer, multi?, feedback }] }
// `answer` is a letter ('C'), or comma-joined letters for multi-select questions ('A,C,D').
import { weeks as sdgWeeks } from './questions.js'
import sdgExtra from './extraQuestions.json'
import ieData from './incubation.json'
import ieExtra from './incubationExtra.json'
import ieWhy from './incubationWhy.json'

const LETTERS = 'ABCDEFGH'
const COURSE_KEY = 'course'

// One question of the NPTEL-style export (options as plain strings, answers as indices) → app shape.
function mapQuestion(q, id, note, why) {
  const answerIdx = [...q.answer].sort((a, b) => a - b)
  const letters = answerIdx.map(idx => LETTERS[idx])
  return {
    id,
    text: q.text,
    options: q.options.map((text, oi) => ({ letter: LETTERS[oi], text })),
    answer: letters.join(','),
    multi: letters.length > 1,
    why: why && why[id],
    feedback:
      `Ans. ${letters.join(', ')} = ${answerIdx.map(idx => q.options[idx]).join(' | ')}` +
      (note ? ` — ${note}` : ''),
  }
}

const weekIdOf = (data, w) => `${data.id}-week${w.week}`

function mapWeeks(data) {
  return data.weeks.map(w => ({
    id: weekIdOf(data, w),
    label: `Week ${w.week}`,
    topic: w.topic,
    questions: w.questions.map((q, i) =>
      mapQuestion(q, `${data.id}w${w.week}q${i + 1}`,
        w.unofficial ? 'unofficial answer, not published by NPTEL' : '', ieWhy)),
  }))
}

// Extra practice questions, keyed by week id exactly like extraQuestions.json.
function mapExtras(data, note) {
  return Object.fromEntries(data.weeks.map(w => [
    weekIdOf(data, w),
    w.questions.map((q, i) => mapQuestion(q, `${data.id}w${w.week}x${i + 1}`, note)),
  ]))
}

export const courses = [
  {
    id: 'ie',
    name: ieData.name,
    short: ieData.short,
    weeks: mapWeeks(ieData),
    extraMap: mapExtras(ieExtra, 'practice question written from the course lecture decks'),
  },
  {
    id: 'sdg',
    name: 'Sustainable Development Goals',
    short: 'SDGs',
    weeks: sdgWeeks,
    extraMap: sdgExtra,
  },
  // `extras` drives the Brain toggle: hide it for a course with no extra questions.
].map(c => ({ ...c, extras: c.weeks.some(w => (c.extraMap[w.id] || []).length > 0) }))

export function getActiveCourseId() {
  try {
    const saved = localStorage.getItem(COURSE_KEY)
    if (courses.some(c => c.id === saved)) return saved
  } catch { /* storage blocked */ }
  return courses[0].id
}

export function setActiveCourseId(id) {
  try { localStorage.setItem(COURSE_KEY, id) } catch { /* storage blocked */ }
}

export function getActiveCourse() {
  return courses.find(c => c.id === getActiveCourseId()) || courses[0]
}
