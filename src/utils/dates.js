const STUDY_DAYS = 7

export function formatDateISO(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso, days) {
  const d = parseDateISO(iso)
  d.setDate(d.getDate() + days)
  return formatDateISO(d)
}

export function getStudyDayNumber(studyStartDate, currentDateISO) {
  const start = parseDateISO(studyStartDate)
  const current = parseDateISO(currentDateISO)
  const diffMs = current - start
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

export function getStudyDates(studyStartDate) {
  const dates = []
  for (let i = 0; i < STUDY_DAYS; i++) {
    dates.push({
      studyDay: i + 1,
      date: addDays(studyStartDate, i),
    })
  }
  return dates
}

export function isDateInStudyRange(studyStartDate, dateISO) {
  const dayNum = getStudyDayNumber(studyStartDate, dateISO)
  return dayNum >= 1 && dayNum <= STUDY_DAYS
}

export function isStudyDateISO(studyStartDate, dateISO) {
  if (!studyStartDate || !dateISO) return false
  return getStudyDates(studyStartDate).some((d) => d.date === dateISO)
}

export function formatDisplayDate(iso) {
  const d = parseDateISO(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export { STUDY_DAYS }
