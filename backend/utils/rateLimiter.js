/**
 * A lightweight, in-memory sliding-window rate limiter middleware.
 * Tracks client IP requests to throttle automated or rapid successive requests.
 */
function rateLimit({ windowMs, max, message }) {
  const requests = new Map()

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown-ip'
    const now = Date.now()

    if (!requests.has(ip)) {
      requests.set(ip, [])
    }

    let timestamps = requests.get(ip)
    
    // Filter out request timestamps that are older than the sliding window limit
    timestamps = timestamps.filter(time => now - time < windowMs)
    requests.set(ip, timestamps)

    if (timestamps.length >= max) {
      console.warn(`[Rate Limiter] Throttled request from IP: ${ip} for ${req.originalUrl || req.url}`)
      return res.status(429).json({
        error: message || 'Too many requests. Please try again later.'
      })
    }

    // Record the current request timestamp
    timestamps.push(now)
    next()
  }
}

module.exports = { rateLimit }
