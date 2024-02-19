import { join } from 'node:path';
import process from 'node:process';

export type LogLevel = 'debug' | 'error' | 'info' | 'warn';

const defaultOption = {
	/**
	 * Path to the config file
	 *
	 * @defaultValue './i18n-validate.json'
	 */
	config: './i18n-validate.json',

	/**
	 * Exclude files from parsing
	 *
	 * @defaultValue '**\/node_modules/**'
	 */
	exclude: '**/node_modules/**' as string[] | string,

	/**
	 * Exit immediately if an error is found
	 *
	 * @defaultValue false
	 */
	exitOnError: false,

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
	nsFolderSeparator: '/',

	/**
	 * Suffixes to use for plural keys
	 */
	pluralSuffixes: ['plural', 'zero', 'one', 'two', 'few', 'many', 'other', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],

	/**
	 * Plural separator for translation keys
	 *
	 * @defaultValue '_'
	 */
	pluralSeparator: '_'
};

export type OptionsWithDefault = typeof defaultOption;

export async function parseOptionsFile(cliOptions: OptionsWithDefault): Promise<OptionsWithDefault> {
	const config = cliOptions.config;
	const configUrl = join(process.cwd(), config).replaceAll('\\', '/');

	let options: { default: OptionsWithDefault };

	if (configUrl.endsWith('.json')) {
		options = await import(`file://${configUrl}`, {
			assert: {
				type: 'json'
			}
		}).catch(() => ({
			default: {}
		}));
	} else {
		options = await import(`file://${configUrl}`).catch(() => ({
			default: {}
		}));
	}

	return {
		...defaultOption,
		...options.default,
		...cliOptions
	};
}
