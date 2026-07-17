import { useRef, useEffect, useState } from 'react'
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision'
function PoseCamera() {
const videoRef = useRef(null)
const canvasRef = useRef(null)
const [ready, setReady] = useState(false)
const [error, setError] = useState(null)
useEffect(() => {
let poseLandmarker
let animationFrameId
let stream
async function setup() {
try {
// 1. Ask the browser for webcam access. This triggers the
// permission prompt — if the user denies it, getUserMedia rejects.
stream = await navigator.mediaDevices.getUserMedia({ video: true })
videoRef.current.srcObject = stream
await videoRef.current.play()
// 2. Load MediaPipe's WASM runtime + the pose model.
// FilesetResolver fetches the WASM binaries MediaPipe needs to
// run pose detection efficiently in the browser (not pure JS).
const vision = await FilesetResolver.forVisionTasks(
'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
)
poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
baseOptions: {
modelAssetPath:
'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
delegate: 'GPU', // uses the device GPU when available — much faster
},
runningMode: 'VIDEO', // vs 'IMAGE' — optimized for a continuous stream
})
setReady(true)
detectFrame()
} catch (err) {
// Covers both "camera permission denied" and "model failed to load"
setError(err.message)
}
}
function detectFrame() {
const video = videoRef.current
const canvas = canvasRef.current

if (!video || !canvas || !poseLandmarker) return
canvas.width = video.videoWidth
canvas.height = video.videoHeight
const ctx = canvas.getContext('2d')
const drawingUtils = new DrawingUtils(ctx)
// detectForVideo needs a timestamp to track frame ordering internally —
// performance.now() is a monotonically increasing clock, perfect for this.
const result = poseLandmarker.detectForVideo(video, performance.now())
ctx.clearRect(0, 0, canvas.width, canvas.height)
if (result.landmarks.length > 0) {
// landmarks[0] = the first detected person's 33 keypoints
drawingUtils.drawLandmarks(result.landmarks[0])
drawingUtils.drawConnectors(result.landmarks[0], PoseLandmarker.POSE_CONNECTIONS)
}
animationFrameId = requestAnimationFrame(detectFrame)
}
setup()
// Cleanup: stop the camera and cancel the detection loop when this
// component unmounts — otherwise the webcam LED stays on forever.
return () => {
if (animationFrameId) cancelAnimationFrame(animationFrameId)
if (stream) stream.getTracks().forEach((track) => track.stop())
if (poseLandmarker) poseLandmarker.close()
}
}, [])
if (error) {
return (
<div className="text-red-400 p-6">
Camera error: {error}. Please allow camera access and reload.
</div>
)
}
return (
<div className="relative max-w-2xl mx-auto">
<video ref={videoRef} className="w-full rounded-lg" muted playsInline />
<canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
{!ready && <p className="text-slate-400 text-sm mt-2">Loading pose model...</p>}
</div>
)
}
export default PoseCamera