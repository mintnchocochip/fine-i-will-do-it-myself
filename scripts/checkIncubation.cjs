// Sanity check for the UIE course data + the letter/answer mapping in src/data/courses.js.
// Run: node scripts/checkIncubation.cjs
const assert = require('assert')
const LETTERS = 'ABCDEFGH'

const files = [
  { data: require('../src/data/incubation.json'), kind: 'q', perWeek: 10 },
  { data: require('../src/data/incubationExtra.json'), kind: 'x', perWeek: null },
]

const ids = new Set()
const texts = new Map()
let total = 0

for (const { data, kind, perWeek } of files) {
  for (const w of data.weeks) {
    assert(typeof w.week === 'number', 'week number missing')
    if (perWeek) assert(w.questions.length === perWeek, `week ${w.week}: ${w.questions.length} questions, expected ${perWeek}`)

    w.questions.forEach((q, i) => {
      const where = `${data.id} week ${w.week} ${kind}${i + 1}`
      assert(q.text && q.text.trim(), `${where}: empty text`)
      assert(q.options.length >= 2, `${where}: needs 2+ options`)
      q.options.forEach(o => assert(o && o.trim(), `${where}: empty option`))
      assert(new Set(q.options).size === q.options.length, `${where}: duplicate option text`)
      assert(Array.isArray(q.answer) && q.answer.length, `${where}: no answer`)
      assert(new Set(q.answer).size === q.answer.length, `${where}: duplicate answer index`)
      q.answer.forEach(idx =>
        assert(Number.isInteger(idx) && idx >= 0 && idx < q.options.length, `${where}: answer index ${idx} out of range`))

      // Grading compares exact strings, so stored letters must be in the same
      // ascending order QuestionCard produces from the user's clicks.
      const letters = q.answer.map(idx => LETTERS[idx]).sort()
      assert.strictEqual(letters.join(','), [...letters].sort().join(','), `${where}: letters not sorted`)

      const id = `${data.id}w${w.week}${kind}${i + 1}`
      assert(!ids.has(id), `duplicate question id ${id}`)
      ids.add(id)

      // An extra question repeating an official one would be graded twice in one session.
      const key = q.text.toLowerCase().replace(/[^a-z0-9]/g, '')
      assert(!texts.has(key), `${where}: same question text as ${texts.get(key)}`)
      texts.set(key, where)
      total++
    })
  }
}

// Answers should not cluster in one position, or the quiz is guessable.
const spread = [0, 0, 0, 0]
for (const { data } of files)
  for (const w of data.weeks)
    for (const q of w.questions)
      for (const a of q.answer) if (a < 4) spread[a]++
const min = Math.min(...spread), max = Math.max(...spread)
assert(min > max / 3, `answer positions too skewed: ${spread}`)

console.log(`OK — ${total} questions, ${ids.size} unique ids, answer spread ${spread}`)
