import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Must match your GitHub repository name (GitHub Pages project site path).
// Current remote: SoniaSuns/storytelling-pilot → https://soniasuns.github.io/storytelling-pilot/
const GITHUB_PAGES_BASE = '/storytelling-pilot/'

export default defineConfig({
  plugins: [react()],
  base: GITHUB_PAGES_BASE,
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
