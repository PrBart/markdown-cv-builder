import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Get base URL from environment or repository name
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return '/'
  }
  // For GitHub Pages deployment
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'markdown-cv-builder'
  return `/${repo}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: getBaseUrl(),
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
  },
})
