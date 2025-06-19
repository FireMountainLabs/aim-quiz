import { defineConfig } from 'vite'

export default defineConfig({
  base: '/aim-quiz/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        // Replace EmailJS placeholders during build
        return html.replace(/{{EMAILJS_USER_ID}}/g, process.env.EMAILJS_USER_ID || '')
                  .replace(/{{EMAILJS_SERVICE_ID}}/g, process.env.EMAILJS_SERVICE_ID || '')
                  .replace(/{{EMAILJS_TEMPLATE_ID}}/g, process.env.EMAILJS_TEMPLATE_ID || '')
      }
    }
  ]
}) 