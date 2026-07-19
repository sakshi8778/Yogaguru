function normalizeKeypoints(landmarks) { 
const leftShoulder = landmarks[11] 
const rightShoulder = landmarks[12] 
const leftHip = landmarks[23] 
const rightHip = landmarks[24] 
const centerX = (leftHip.x + rightHip.x) / 2 
const centerY = (leftHip.y + rightHip.y) / 2   
const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2 
const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2 
const torsoLength = Math.hypot(shoulderMidX - centerX, shoulderMidY - centerY) || 1 

return landmarks.map((point) => ({ 
    x: (point.x- centerX) / torsoLength, 
    y: (point.y- centerY) / torsoLength, 
    z: point.z / torsoLength, 
})) 
} 
module.exports = { normalizeKeypoints }