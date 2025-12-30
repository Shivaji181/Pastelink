import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    plugins: [react()],
    // Proxy removed for standalone deployment. 
    // Uses VITE_API_URL env var in client code instead.
  }
})
