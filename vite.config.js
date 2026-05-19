import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change this when deploying to a different GitHub Pages repo name
const GITHUB_PAGES_BASE = '/hci-diary-study/'

export default defineConfig({
  plugins: [react()],
  base: GITHUB_PAGES_BASE,
})
