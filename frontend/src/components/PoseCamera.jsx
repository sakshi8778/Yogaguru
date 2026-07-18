import { useRef, useEffect, useState } from 'react'
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision'
import { usePoseScoring, AccuracyBadge } from '../hooks/usePoseScoring'

function PoseCamera({ activePoseName }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const { score, feedback, scoreFrame } = usePoseScoring(activePoseName)

  useEffect(() => {
    let poseLandmarker
    let animationFrameId
    let stream

    async function setup() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
        })

        setReady(true)
        detectFrame()
      } catch (err) {
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
      const result = poseLandmarker.detectForVideo(video, performance.now())
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (result.landmarks && result.landmarks.length > 0) {
        drawingUtils.drawLandmarks(result.landmarks[0])
        drawingUtils.drawConnectors(result.landmarks[0], PoseLandmarker.POSE_CONNECTIONS)
        scoreFrame(result.landmarks[0])
      }
      animationFrameId = requestAnimationFrame(detectFrame)
    }

    setup()
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (stream) stream.getTracks().forEach((track) => track.stop())
      if (poseLandmarker) poseLandmarker.close()
    }
  }, [activePoseName, scoreFrame])

  if (error) {
    return (
      <div className="text-red-400 p-6">Camera error: {error}. Please allow camera access and reload.</div>
    )
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <video ref={videoRef} className="w-full rounded-lg" muted playsInline />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <AccuracyBadge score={score} feedback={feedback} />
      {!ready && <p className="text-slate-400 text-sm mt-2">Loading pose model...</p>}
    </div>
  )
}

export default PoseCamera