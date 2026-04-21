import Cookies from 'js-cookie'

const SCORES_KEY = 'sdg_scores'
const USER_KEY = 'sdg_user'
const EXPIRES = 365

export function getUser() {
  const raw = Cookies.get(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveUser(user) {
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: EXPIRES })
}

export function clearUser() {
  Cookies.remove(USER_KEY)
}

export function getScores() {
  const raw = Cookies.get(SCORES_KEY)
  return raw ? JSON.parse(raw) : {}
}

// Save results from a completed session.
// results is an array of { weekId, isCorrect }
export function saveSessionResults(results) {
  const scores = getScores()
  results.forEach(({ weekId, isCorrect }) => {
    if (!scores[weekId]) {
      scores[weekId] = { attempts: 0, correct: 0, total: 0 }
    }
    scores[weekId].attempts += 1
    scores[weekId].total += 1
    if (isCorrect) scores[weekId].correct += 1
  })
  Cookies.set(SCORES_KEY, JSON.stringify(scores), { expires: EXPIRES })
}

export function clearScores() {
  Cookies.remove(SCORES_KEY)
}

export function getWeekAccuracy(weekId) {
  const scores = getScores()
  const w = scores[weekId]
  if (!w || w.total === 0) return null
  return w.correct / w.total
}

// Returns weeks sorted by accuracy ascending (weakest first)
export function getWeakWeeks(minAttempts = 5) {
  const scores = getScores()
  return Object.entries(scores)
    .filter(([, d]) => d.total >= minAttempts)
    .map(([weekId, d]) => ({ weekId, accuracy: d.correct / d.total, ...d }))
    .sort((a, b) => a.accuracy - b.accuracy)
}
