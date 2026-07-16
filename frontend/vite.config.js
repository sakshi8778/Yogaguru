import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
plugins: [
react(),
// enables JSX + fast refresh
tailwindcss(), // enables Tailwind utility classes app-wide
],
server: {
port: 5173,
},
})