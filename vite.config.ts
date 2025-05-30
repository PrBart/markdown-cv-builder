import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Get the repository name dynamically
const getBase = () => {
  // For local development
  if (process.env.NODE_ENV === 'development') {
    return '/'
  }

  // For GitHub Pages deployment
  try {
    // Try to get from environment first (CI/CD can set this)
    if (process.env.GITHUB_REPOSITORY) {
      const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
      return `/${repoName}/`
    }

    // Fallback to package.json
    const pkg = require('./package.json')
    if (pkg.repository?.url) {
      const repoName = pkg.repository.url
        .replace(/\.git$/, '')
        .split('/')
        .pop()
      return `/${repoName}/`
    }

    if (pkg.homepage) {
      const path = new URL(pkg.homepage).pathname
      if (path !== '/') return path
    }
  } catch (e) {
    console.warn('Could not determine repository name, using default base')
  }

  return '/'
}

// https://vite.dev/config/
export default defineConfig({
  base: getBase(),
  plugins: [react()],
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
})
