import { defineConfig } from 'vitest/config';

export const createVitestConfig = () =>
	defineConfig({
		test: {
			globals: true,
			coverage: {
				reporter: ['text', 'lcov', 'clover']
			}
		}
	});
