import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    build: {
        target: 'es2020',
        minify: true,
        lib: {
            entry: 'src/index.ts',
            name: 'HtmlDialog',
            formats: ['es', 'iife'],
            fileName: (format) => (format === 'es' ? 'html-dialog.js' : 'html-dialog.iife.js'),
        },
    },
    test: {
        include: ['test/**/*.test.ts'],
        browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
        },
        coverage: {
            provider: 'v8',
            include: ['src/**'],
            thresholds: { lines: 90, branches: 85 },
        },
    },
})
