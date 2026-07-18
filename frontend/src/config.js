export const API_BASE_URL = import.meta.env.VITE_API_URL
if (!API_BASE_URL) {
// Fails loudly in the console during development if the env var
// is missing, instead of silently sending requests to "undefined/api/..."
console.error('VITE_API_URL is not set — check your .env file')}