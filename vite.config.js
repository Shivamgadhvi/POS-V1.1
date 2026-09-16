import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set this to match your GitHub repo name exactly, e.g. "/Order_Test/"
export default defineConfig({
  plugins: [react()],
  base: '/Order_Test/',
})
