const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Uploads a pose image buffer to Cloudinary.
 * @param {Buffer} buffer - The image binary buffer.
 * @param {string} slug - The public ID/slug.
 * @param {string} mimeType - The mime type of the image (defaults to image/jpeg).
 * @returns {Promise<string>} - Resolves to the secure_url.
 */
function uploadPoseImage(buffer, slug, mimeType = 'image/jpeg') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'pose-images',
        public_id: slug,
        overwrite: true,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    )
    uploadStream.end(buffer)
  })
}

module.exports = { uploadPoseImage }
