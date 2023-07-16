import { URL } from 'node:url';

import isCI from 'is-ci';

export type LogLevel = 'debug' | 'error' | 'info' | 'warn';

const defaultOption = {
	/**
	 * Path to the config file
	 *
	 * @defaultValue './i18n-validate.json'
	 */
	config: './i18n-validate.json',

	/**
	 * names of the translation function
	 *
	 * @defaultValue ['t', 'i18next.t', 'i18n.t']
	 */
	functions: ['t', 'i18next.t', 'i18n.t'],

	/**
	 * Glob pattern to match input files
	 *
	 * @defaultValue "**\/*.{js,jsx,ts,tsx}""
	 */
	inputs: '**/*.{js,jsx,ts,tsx}' as string[] | string,

	/**
	 * Path to translation files
	 *
	 * @defaultValue 'i18n'
	 */
	localeFolder: 'i18n',

	/**
	 * Path to translation files
	 *
	 * @defaultValue '{{lng}}/{{ns}}.json'
	 *
	 * @remarks
	 * You can use `{{lng}}` for language and `{{ns}}` for namespace
	 */
	localePath: '{{lng}}/{{ns}}.json',

	/**
	 * Log level
	 *
	 * @defaultValue 'info'
	 */
	logLevel: 'info' as LogLevel,

	/**
	 * Namespace separator for translation keys
	 *
	 * @defaultValue ':'
	 */
	nsSeparator: ':',

	/**
	 * Throw an error if invalid keys are found
	 *
	 * @defaultValue {isCI}
	 *
	 * @remarks
	 * For CI/CD environments, it's default value is `true` else `false`
	 */
	throwOnInvalidKeys: isCI,

	/**
	 * Throw an error if variables are missing in the source code
	 *
	 * @defaultValue {isCI}
	 *
	 * @remarks
	 * For CI/CD environments, it's default value is `true` else `false`
	 */
	throwOnMissingVariables: isCI
};

export type Options = typeof defaultOption;

export async function parseOptionsFile(cliOptions: Options): Promise<Options> {
	const config = cliOptions.config;
	const configUrl = new URL(config, import.meta.url);
	const options = await import(configUrl.toString()).catch(() => ({}));

	return {
		...defaultOption,
		...options,
		...cliOptions
	};
}
