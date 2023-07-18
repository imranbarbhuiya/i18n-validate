import { createTsupConfig } from '../../scripts/tsup.config.js';

export default createTsupConfig({
	dts: false,
	entry: ['src/index.ts']
});
