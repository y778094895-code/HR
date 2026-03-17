import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 3001,
        proxy: {
            '/api': {
                target: process.env.VITE_PROXY_TARGET || 'http://localhost:8080',
                changeOrigin: true,
            }
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom', 'zustand', 'react-i18next', 'i18next'],
                    'vendor-radix': [
                        '@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-select',
                        '@radix-ui/react-tabs', '@radix-ui/react-popover', '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-avatar', '@radix-ui/react-tooltip', '@radix-ui/react-slot'
                    ],
                    'vendor-ui': ['lucide-react', 'recharts', 'date-fns', 'clsx', 'tailwind-merge'],
                }
            }
        },
        chunkSizeWarningLimit: 600,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
    },
})
