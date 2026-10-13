import Cookies from 'js-cookie'

const SCORES_KEY = 'sdg_scores'
const USER_KEY = 'sdg_user'
const SEEN_KEY = 'sdg_seen'
const WRONG_KEY = 'sdg_wrong'
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

export function saveSessionResults(results) {
  const scores = getScores()
  results.forEach(({ weekId, isCorrect }) => {
    if (!scores[weekId]) scores[weekId] = { attempts: 0, correct: 0, total: 0 }
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

export function getWeakWeeks(minAttempts = 5) {
  const scores = getScores()
  return Object.entries(scores)
    .filter(([, d]) => d.total >= minAttempts)
    .map(([weekId, d]) => ({ weekId, accuracy: d.correct / d.total, ...d }))
    .sort((a, b) => a.accuracy - b.accuracy)
}

// ── Seen question tracking ──

export function getSeenQuestionIds() {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function markQuestionsSeen(questionIds) {
  try {
    const seen = new Set(getSeenQuestionIds())
    questionIds.forEach(id => seen.add(id))
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))
  } catch { /* quota exceeded */ }
}

// ── Wrong question tracking ──
// Stores { questionId: { count, weekId, text } }

export function getWrongQuestionsMap() {
  try {
    const raw = localStorage.getItem(WRONG_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function trackWrongAnswers(results) {
  // results: array of { questionId, weekId, questionText, isCorrect }
  try {
    const map = getWrongQuestionsMap()
    results.forEach(r => {
      if (!r.isCorrect) {
        if (!map[r.questionId]) {
          map[r.questionId] = { count: 0, weekId: r.weekId, text: r.questionText }
        }
        map[r.questionId].count += 1
      } else {
        // Remove from wrong list once answered correctly
        delete map[r.questionId]
      }
    })
    localStorage.setItem(WRONG_KEY, JSON.stringify(map))
  } catch { /* quota exceeded */ }
}

export function getWrongQuestionIds() {
  return Object.keys(getWrongQuestionsMap())
}

export function getWrongQuestionCount() {
  return Object.keys(getWrongQuestionsMap()).length
}

// ── Stats export / import ──

export function exportStats() {
  const scores = getScores()
  const user = getUser()
  const wrong = getWrongQuestionsMap()
  const seen = getSeenQuestionIds()
  const payload = { v: 1, n: user?.name || '', s: scores, w: wrong, seen }
  return 'SDGv1:' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

export function importStats(encoded) {
  try {
    const clean = encoded.trim()
    if (!clean.startsWith('SDGv1:')) return { ok: false, error: 'Invalid code format' }
    const payload = JSON.parse(decodeURIComponent(escape(atob(clean.slice(6)))))
    if (payload.v !== 1) return { ok: false, error: 'Unsupported version' }
    if (payload.s) Cookies.set(SCORES_KEY, JSON.stringify(payload.s), { expires: EXPIRES })
    if (payload.w) localStorage.setItem(WRONG_KEY, JSON.stringify(payload.w))
    if (payload.seen) localStorage.setItem(SEEN_KEY, JSON.stringify(payload.seen))
    return { ok: true, name: payload.n || '' }
  } catch {
    return { ok: false, error: 'Could not read code — make sure you copied it completely' }
  }
}
