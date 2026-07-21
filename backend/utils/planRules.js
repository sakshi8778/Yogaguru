// utils/planRules.js
// Deterministic, code-level filtering rules that run BEFORE and AFTER
// the Gemini call. We do NOT trust the LLM alone to reliably exclude
// unsafe poses for health conditions — that's enforced here in plain
// JS, with Gemini only responsible for creative sequencing/instructions.
const AGE_GROUP_INTENSITY = {
kid: 'high-energy, playful, short holds (15-20s)',
teen: 'moderate-to-high energy, longer holds (30-45s)',
adult: 'balanced flow, standard holds (45-60s)',
elderly: 'gentle, low-impact, extended holds with rest (60-90s), no jumping or deep twists',
}
// Poses that are contraindicated (unsafe/discouraged) for specific
// health conditions — a hardcoded safety list rather than relying on
// the model to remember this every single generation.
const CONTRAINDICATED_POSES = {
back_pain: ['Forward Fold', 'Wheel Pose', 'Deep Twist'],
knee_issue: ['Hero Pose', 'Pigeon Pose', 'Deep Lunge'],
high_bp: ['Headstand', 'Shoulder Stand', 'Wheel Pose'],
}
function buildPromptConstraints({ ageGroup, healthConditions }) {
const intensity = AGE_GROUP_INTENSITY[ageGroup] || AGE_GROUP_INTENSITY.adult
const excludedPoses = [
...new Set(healthConditions.flatMap((cond) => CONTRAINDICATED_POSES[cond] || [])),
]
return { intensity, excludedPoses }
}
// Runs AFTER Gemini responds, as a safety net — strips out any poses
// the model included despite instructions not to. Belt-and-suspenders:
// the prompt asks Gemini to avoid them, and this filter guarantees it
// even if the model doesn't fully comply.
function filterUnsafePoses(poses, excludedPoses) {
return poses.filter((pose) => !excludedPoses.includes(pose.name))
}
function buildAdaptationNotes({ ageGroup, healthConditions, excludedPoses }) {
const notes = [`Sequence paced for ${ageGroup.replace('_', ' ')} energy levels`]
if (excludedPoses.length > 0) {
notes.push(`Excluded poses that may aggravate: ${healthConditions.join(', ')}`)
}
return notes
}
module.exports = { buildPromptConstraints, filterUnsafePoses, buildAdaptationNotes }