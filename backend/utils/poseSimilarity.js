const { normalizeKeypoints } = require('./normalizeKeypoints')
function cosineSimilarity(vecA, vecB) { 
    let dot = 0, magA = 0, magB = 0 
    for (let i = 0; i < vecA.length; i++) { 
        dot += vecA[i] * vecB[i] 
        magA += vecA[i] * vecA[i] 
        magB += vecB[i] * vecB[i] 
    } 
    if (magA === 0 || magB === 0) return 0 
    return dot / (Math.sqrt(magA) * Math.sqrt(magB)) 
} 
function flatten(normalizedPoints) { 
    return normalizedPoints.flatMap((p) => [p.x, p.y, p.z]) 
} // Joint names for the limbs most likely to be visibly "wrong" in yoga — // used to give specific text feedback, not just a raw score. 
const JOINT_LABELS = { 
    13: 'left elbow', 
    14: 'right elbow', 
    25: 'left knee', 
    26: 'right knee', 
    11: 'left shoulder', 
    12: 'right shoulder', 
} 
function comparePoses(liveLandmarks, referenceNormalized) { 
    const liveNormalized = normalizeKeypoints(liveLandmarks) 

    const overallScore = 
    cosineSimilarity(flatten(liveNormalized), flatten(referenceNormalized)) * 100 
    // Find the single joint with the largest positional deviation — // that becomes the specific correction cue, rather than a vague // "adjust your pose" for every mismatch. 
    let worstJointIndex = null 
    let worstDeviation = 0 
    for (const indexStr of Object.keys(JOINT_LABELS)) { 
        const i = Number(indexStr) 
        const dx = liveNormalized[i].x- referenceNormalized[i].x 
        const dy = liveNormalized[i].y- referenceNormalized[i].y 
        const deviation = Math.hypot(dx, dy) 
        if (deviation > worstDeviation) { 
            worstDeviation = deviation 
            worstJointIndex = i 
        } 
    
}
let feedback = 'Great form!' 
if (overallScore < 80 && worstJointIndex !== null) { 
    feedback = `Adjust your ${JOINT_LABELS[worstJointIndex]}` 
  } 
return { accuracy: Math.max(0, Math.min(100, overallScore)), feedback } 
} 
module.exports = { comparePoses, cosineSimilarity }