const { GoogleGenerativeAI } = require('@google/generative-ai') 

//
const {
buildPromptConstraints,
filterUnsafePoses,
buildAdaptationNotes,
} = require('./utils/planRules')


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
async function generateDailyPlan({ ageGroup, healthConditions, goals }) {
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
const { intensity, excludedPoses } = buildPromptConstraints({ ageGroup, healthConditions })
const prompt = `
You are a certified yoga instructor. Create a 5-pose daily yoga sequence
for a person in age group "${ageGroup}" with goals: ${goals.join(', ')}.
Pacing requirement: ${intensity}
Do NOT include any of these poses under any circumstances: ${excludedPoses.join(', ') ||
'none'}
Respond with ONLY valid JSON, no markdown fences, in this exact shape:
{ "poses": [ { "name": "string", "durationSeconds": number, "instructions": "string" } ] }
`
const result = await model.generateContent(prompt)
const text = result.response.text()
let parsed
try {
parsed = JSON.parse(text)
} catch {
parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
}
// Safety net: filter again in code, don't trust the prompt alone.
parsed.poses = filterUnsafePoses(parsed.poses, excludedPoses)
parsed.adaptationNotes = buildAdaptationNotes({ ageGroup, healthConditions,
excludedPoses })
return parsed
}

module.exports = { generateDailyPlan } 