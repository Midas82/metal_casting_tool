import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base URL for GitHub Pages
  // If deploying to https://<USERNAME>.github.io/, use '/'
  // If deploying to https://<USERNAME>.github.io/<REPO>/, use '/<REPO>/'
  base: '/',
})
