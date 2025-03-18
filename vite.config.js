import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

console.log(process.env.LIFF_PORT)
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: process.env.LIFF_RESERVE_PORT,
  },
  build: {
    outDir: 'distReservation',
  },
});
