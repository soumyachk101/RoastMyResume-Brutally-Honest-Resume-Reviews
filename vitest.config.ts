import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['**/*.test.ts', '**/*.spec.ts'],
        exclude: ['**/e2e/**', '**/node_modules/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            exclude: [
                'node_modules/',
                'tests/fixtures/',
                '**/*.d.ts',
                '**/*.config.*',
            ],
            thresholds: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
            },
        },
    },
});
