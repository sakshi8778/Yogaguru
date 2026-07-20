function calculateStreak(sessionDates) {
if (sessionDates.length === 0) return 0
// Reduce each timestamp to a plain YYYY-MM-DD string and dedupe —
// multiple sessions on the same calendar day should count as one.
const uniqueDays = [...new Set(
sessionDates.map((d) => new Date(d).toISOString().slice(0, 10))
)].sort() // ascending chronological order
let streak = 1
for (let i = uniqueDays.length - 1; i > 0; i--) {
const current = new Date(uniqueDays[i])
const previous = new Date(uniqueDays[i - 1])
const dayDiff = (current - previous) / (1000 * 60 * 60 * 24)
if (dayDiff === 1) {
streak++
} else {
break // gap found — streak stops counting further back
}
}
// If the most recent session wasn't today or yesterday, the streak
// is effectively broken (they haven't done anything since).
const mostRecent = new Date(uniqueDays[uniqueDays.length - 1])
const today = new Date(new Date().toISOString().slice(0, 10))
const daysSinceLast = (today - mostRecent) / (1000 * 60 * 60 * 24)
if (daysSinceLast > 1) return 0
return streak
}
module.exports = { calculateStreak }