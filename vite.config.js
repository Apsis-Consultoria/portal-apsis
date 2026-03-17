// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // mantenha seus plugins

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // escuta em 0.0.0.0 (necessário em containers/remotos)
    port: 5173,          // ajuste se estiver usando outra porta
    allowedHosts: [
      // autoriza explicitamente o host que o Vite está bloqueando
      'ta-01kkydwd1w6ay52ngaeneddq6z-5173-k3hnkn910gg7yl4gj1vs8wocu.w.modal.host',

      // opcional: coringas úteis (deixe se fizer sentido no seu fluxo)
      '.modal.host',
      'localhost',
      '127.0.0.1'
    ],
    // Se o preview for acessado por HTTPS via proxy (bem comum nesses hosts),
    // o HMR precisa saber qual host/porta o browser enxerga:
    hmr: {
      host: 'ta-01kkydwd1w6ay52ngaeneddq6z-5173-k3hnkn910gg7yl4gj1vs8wocu.w.modal.host',
      protocol: 'wss',   // usa WebSocket seguro atrás de proxy HTTPS
      clientPort: 443    // porta externa que o navegador usa
    }
  }
})