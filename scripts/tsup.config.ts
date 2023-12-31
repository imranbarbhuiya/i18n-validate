import { relative, resolve as resolveDir } from 'node:path';
import process from 'node:process';

import { defineConfig, type Options } from 'tsup';

export const createTsupConfig = (options: Options = {}) =>
	defineConfig({
		clean: true,
		dts: true,
		entry: ['src/index.ts'],
		format: ['esm'],
		minify: false,
		skipNodeModulesBundle: true,
		sourcemap: true,
		target: 'esnext',
		keepNames: true,
		tsconfig: relative(__dirname, resolveDir(process.cwd(), 'src', 'tsconfig.json')),
		treeshake: true,
		...options
	});
