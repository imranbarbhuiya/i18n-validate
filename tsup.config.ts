import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';
import { defineConfig } from 'tsup';

export default defineConfig({
	clean: true,
	dts: true,
	entry: ['src/cli.ts'],
	format: ['esm'],
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'esnext',
	keepNames: true,
	tsconfig: 'src/tsconfig.json',
	treeshake: true,
	esbuildPlugins: [esbuildPluginVersionInjector()]
});
