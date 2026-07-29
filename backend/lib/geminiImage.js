const { GoogleGenAI } = require('@google/genai')
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

/**
 * Generates a reference image buffer for a yoga pose using gemini-2.5-flash-image.
 * @param {string} poseName - The name of the pose.
 * @param {string} poseInstructions - The instructions for alignment.
 * @returns {Promise<Buffer>} - Resolves to the binary image buffer.
 */
async function generatePoseImage(poseName, poseInstructions) {
  const prompt = `A clean, well-lit instructional photograph of a single fit adult yoga instructor demonstrating the '${poseName}' yoga pose, viewed from a three-quarter angle. The instructor wears simple, modest athletic wear (leggings and a fitted t-shirt), against a plain, neutral studio background (soft white or light gray). Correct anatomical alignment for this pose: ${poseInstructions}. Bright, even lighting, sharp focus, photorealistic style, no text, no logos, no watermarks, no other people in frame.`

  console.log(`[Gemini API] Generating reference image for pose: "${poseName}" using gemini-2.5-flash-image`)

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: '16:9',
      },
    },
  })

  let imageBytesBase64 = null
  if (
    response.candidates &&
    response.candidates[0] &&
    response.candidates[0].content &&
    response.candidates[0].content.parts
  ) {
    const parts = response.candidates[0].content.parts
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        imageBytesBase64 = part.inlineData.data
        break
      }
    }
  }

  if (!imageBytesBase64) {
    throw new Error('Response did not contain inline imageBytes data.')
  }

  return Buffer.from(imageBytesBase64, 'base64')
}

module.exports = { generatePoseImage }
