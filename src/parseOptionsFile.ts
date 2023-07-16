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
	 * Throw an error if invalid keys are found
	 *
	 * @defaultValue {isCI}
	 *
	 * @remarks
	 * For CI/CD environments, it's default value is `true` else `false`
	 */
	errorOnInvalidKey: isCI,

	/**
	 * Throw an error if variables are missing in the source code
	 *
	 * @defaultValue {isCI}
	 *
	 * @remarks
	 * For CI/CD environments, it's default value is `true` else `false`
	 */
	errorOnMissingVariable: isCI,

	/**
	 * Throw an error if variables are unused in the source code
	 *
	 * @defaultValue false
	 *
	 */
	errorOnUnusedVariable: false,

	/**
	 * Exclude files from parsing
	 *
	 * @defaultValue '**\/node_modules/**'
	 */
	exclude: '**/node_modules/**' as string[] | string,

	/**
	 * names of the translation function
	 *
	 * @defaultValue ['t', 'i18next.t', 'i18n.t']
	 */
	functions: ['t', 'i18next.t', 'i18n.t'],

	/**
	 * Glob pattern to match input files
	 *
	 * @defaultValue '**\/*.{js,jsx,ts,tsx}'
	 */
	inputs: '**/*.{js,jsx,ts,tsx}' as string[] | string,

	/**
	 * Key separator for nested translation keys
	 *
	 * @defaultValue '.'
	 */
	keySeparator: '.',

	/**
	 * The source language of the translation keys
	 * It'll be used to find missing keys and variables
	 *
	 * @defaultValue 'en'
	 */
	sourceLang: 'en',

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
	 * Folder separator for translation keys
	 *
	 * @defaultValue '/'
	 */
	nsFolderSeparator: '/'
};

export type OptionsWithDefault = typeof defaultOption;

export async function parseOptionsFile(cliOptions: OptionsWithDefault): Promise<OptionsWithDefault> {
	const config = cliOptions.config;
	const configUrl = new URL(config, import.meta.url);
	const options = await import(configUrl.toString()).catch(() => ({}));

	console.log(cliOptions, {
		...defaultOption,
		...options,
		...cliOptions
	});

	return {
		...defaultOption,
		...options,
		...cliOptions
	};
}
