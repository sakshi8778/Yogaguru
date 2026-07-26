const { GoogleGenerativeAI } = require('@google/generative-ai')

const {
  buildPromptConstraints,
  filterUnsafePoses,
  buildAdaptationNotes,
} = require('./utils/planRules')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * Extracts standard Google API retry delay (in ms) from various structures.
 */
function getRetryDelay(err) {
  if (err.retryDelay) {
    return typeof err.retryDelay === 'number' ? err.retryDelay * 1000 : parseFloat(err.retryDelay) * 1000;
  }

  if (err.errorDetails && Array.isArray(err.errorDetails)) {
    for (const detail of err.errorDetails) {
      if (detail.metadata && detail.metadata.retryDelay) {
        return parseFloat(detail.metadata.retryDelay) * 1000;
      }
    }
  }

  if (err.response?.error?.details && Array.isArray(err.response.error.details)) {
    for (const detail of err.response.error.details) {
      if (detail.metadata && detail.metadata.retryDelay) {
        return parseFloat(detail.metadata.retryDelay) * 1000;
      }
    }
  }

  if (err.message) {
    try {
      const jsonMatch = err.message.match(/({[\s\S]*})/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        const details = parsed.error?.details || parsed.details;
        if (Array.isArray(details)) {
          for (const detail of details) {
            if (detail.metadata && detail.metadata.retryDelay) {
              return parseFloat(detail.metadata.retryDelay) * 1000;
            }
          }
        }
      }
    } catch (_) { }
  }

  return null;
}

/**
 * Executes a function with exponential backoff if a 429 Rate Limit error occurs.
 */
async function callWithRetry(fn, maxRetries = 4, initialDelayMs = 6000) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;

      const isRateLimit = err.status === 429 ||
        err.statusCode === 429 ||
        (err.message && (err.message.includes('429') || err.message.includes('Too Many Requests') || err.message.includes('QuotaFailure'))) ||
        (err.statusText && err.statusText.includes('Too Many Requests'));

      if (isRateLimit && attempt <= maxRetries) {
        const delayMs = getRetryDelay(err) || (initialDelayMs * Math.pow(2, attempt - 1));
        console.warn(`[Gemini API] Quota failure (429). Retrying attempt ${attempt}/${maxRetries} after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw err;
      }
    }
  }
}

/**
 * Generates a 5-pose daily yoga sequence.
 * Falls back to a safe general-purpose sequence if API limits are reached.
 */
async function generateDailyPlan({ ageGroup, healthConditions, goals }) {
  const conditions = healthConditions || []
  const userGoals = goals || []
  const { intensity, excludedPoses } = buildPromptConstraints({ ageGroup, healthConditions: conditions })

  const fallbackPlan = {
    poses: [
      {
        name: "Child's Pose",
        durationSeconds: 60,
        instructions: "Rest your hips on your heels, extend your arms forward, and rest your forehead on the mat. Breathe deeply."
      },
      {
        name: "Cat-Cow Stretch",
        durationSeconds: 60,
        instructions: "On your hands and knees, arch your back towards the ceiling on exhale (Cat) and drop your belly towards the floor on inhale (Cow)."
      },
      {
        name: "Downward-Facing Dog",
        durationSeconds: 60,
        instructions: "Press your hands into the mat, lift your knees, and push your hips up and back to form an inverted V-shape. Keep your head relaxed."
      },
      {
        name: "Cobra Pose",
        durationSeconds: 60,
        instructions: "Lie face down, place hands under shoulders, and gently lift your chest off the mat while keeping your pelvis on the floor."
      },
      {
        name: "Savasana",
        durationSeconds: 120,
        instructions: "Lie flat on your back, feet apart, arms by your side with palms facing up. Close your eyes and relax your entire body."
      }
    ],
    adaptationNotes: buildAdaptationNotes({ ageGroup, healthConditions: conditions, excludedPoses })
  };

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    const prompt = `
You are a certified yoga instructor. Create a 5-pose daily yoga sequence
for a person in age group "${ageGroup}" with goals: ${userGoals.join(', ')}.
Pacing requirement: ${intensity}
Do NOT include any of these poses under any circumstances: ${excludedPoses.join(', ') || 'none'}
Respond with ONLY valid JSON, no markdown fences, in this exact shape:
{ "poses": [ { "name": "string", "durationSeconds": number, "instructions": "string" } ] }
`
    const result = await callWithRetry(() => model.generateContent(prompt));
    const text = result.response.text();
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    }
    // Safety net: filter again in code, don't trust the prompt alone.
    parsed.poses = filterUnsafePoses(parsed.poses || [], excludedPoses)
    parsed.adaptationNotes = buildAdaptationNotes({ ageGroup, healthConditions: conditions, excludedPoses })
    return parsed
  } catch (err) {
    console.error(`[Gemini API] Persistent failure calling Gemini API:`, err);
    console.warn(`[Gemini API] Falling back to safe, gentle default sequence.`);

    // Safety filter the fallback poses just in case
    fallbackPlan.poses = filterUnsafePoses(fallbackPlan.poses, excludedPoses)
    return fallbackPlan
  }
}

module.exports = { generateDailyPlan }