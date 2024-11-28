import rootConfig from '../../eslint.config.mjs';

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
export default [
	...rootConfig,
	{
		rules: {
			'n/hashbang': [
				'error',
				{
					convertPath: {
						'src/**/*.ts': ['^src/(.+?)\\.ts$', 'dist/$1.js']
					}
				}
			]
		}
	}
];
