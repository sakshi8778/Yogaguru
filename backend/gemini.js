const { GoogleGenerativeAI } = require('@google/generative-ai') 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY) 
async function generateDailyPlan({ ageGroup, healthConditions, goals }) { 
    // gemini-2.0-flash is fast and cheap enough for a daily plan generation 
    // // that isn't latency-critical but does happen on every onboarding. 
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) 
// We ask Gemini to return ONLY JSON so we can parse it directly — 
// // no chatty preamble to strip out. 
const prompt = ` You are a certified yoga instructor. Create a 5-pose daily yoga sequence 
for a person in age group "${ageGroup}", with health conditions: 
${healthConditions.join(', ') || 'none'}, and goals: ${goals.join(', ')}.
Respond with ONLY valid JSON, no markdown fences, in this exact shape: 
{
 "poses": [ 
   { "name": "string", "durationSeconds": number, "instructions": "string" } 
    ] 
   } 
    ` 

    const result = await model.generateContent(prompt) 
    const text = result.response.text() 
    try { 
        return JSON.parse(text)
     } catch { 
// Gemini occasionally wraps JSON in ```json fences despite instructions — 
// // strip them before giving up. 
const cleaned = text.replace(/```json|```/g, '').trim() 
return JSON.parse(cleaned) 
} 
} 
module.exports = { generateDailyPlan } 