import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base: emits ./assets/... so the build works whether it is served
  // from a user page (midas82.github.io/), a project page
  // (midas82.github.io/metal_casting_tool/) or a custom domain. An absolute
  // '/' base 404s on a project page, which is where this repo deploys.
  base: './',
})
