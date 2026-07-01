import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/', 
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, './index.html'),
        about: resolve(__dirname, './aboutUs.html'),   
        contacts: resolve(__dirname, './contacts.html'),
        politics: resolve(__dirname, './politics.html')
      },
      // Настройка принудительного изменения имен файлов при каждой сборке
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})
