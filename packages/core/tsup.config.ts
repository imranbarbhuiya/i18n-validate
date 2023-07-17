import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';

import { createTsupConfig } from '../../scripts/tsup.config.js';

export default createTsupConfig({
	dts: {
		entry: 'src/index.ts'
	},
	entry: ['src/index.ts', 'src/cli.ts'],
	esbuildPlugins: [esbuildPluginVersionInjector()]
});
