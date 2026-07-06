import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base: './'` face build-ul relocabil: funcționează pe GitHub Pages
// (https://user.github.io/nume-repo/) și pe Netlify fără nicio modificare.
// Împreună cu HashRouter, nu e nevoie de configurare de server.
export default defineConfig({
  plugins: [react()],
  base: './',
})
