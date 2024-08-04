import { join } from 'node:path';
import process from 'node:process';

import { ValidationError } from './Error.js';
import { log } from './logger.js';
import { type TranslationNode } from './parseFile.js';

import type { OptionsWithDefault } from './parseOptionsFile.js';

const importedFiles = new Map<string, Promise<{ default: Record<string, unknown> }>>();

const importLocaleFile = async (url: string, options: OptionsWithDefault) => {
	if (importedFiles.has(url)) return importedFiles.get(url)!;

	log(`Fetching translation keys from ${url}`, 'debug', options);

	let promise: Promise<{ default: Record<string, unknown> }>;

	if (url.endsWith('.json')) {
		promise = import(`file://${url}`, {
			assert: {
				type: 'json'
			}
		});
	} else promise = import(`file://${url}`);

	importedFiles.set(url, promise);

	return promise;
};

export const validateKey = async (node: TranslationNode, options: OptionsWithDefault) => {
	const filePath = `${options.localeFolder}/${options.localePath.replaceAll('{{lng}}', options.sourceLang).replaceAll('{{ns}}', node.namespace)}`;

	const url = join(process.cwd(), filePath).replaceAll('\\', '/');

	const { default: json }: { default: Record<string, unknown> | null } = await importLocaleFile(url, options).catch(() => ({ default: null }));

	if (!json) {
		log(new ValidationError(`Invalid locale file: ${filePath}`, node.path, node.positions), 'error', options);

		return false;
	}

	const key = node.key;
	const variables = node.variables;

	let value = (
		key.includes(options.keySeparator)
			? (json[key] ?? key.split(options.keySeparator).reduce((acc, cur) => acc[cur] as Record<string, unknown>, json))
			: json[key]
	) as string | undefined;

	if (value === undefined && options.pluralSuffixes.length > 0 && variables.includes('count')) {
		const pluralizedKeys = options.pluralSuffixes.map((suffix) => `${node.key}${options.pluralSeparator}${suffix}`);

		const relatedKey = Object.keys(json).find((key) => pluralizedKeys.includes(key));

		if (relatedKey) value = json[relatedKey] as string;
	}

	if (value === undefined) {
		log(new ValidationError(`Invalid translation key: ${key}`, node.path, node.positions), 'error', options);

		return false;
	}

	const sourceVariables = value.match(/{{(?<var>.*?)}}/g)?.map((variable) => variable.slice(2, -2)) ?? [];

	const missingVariables = sourceVariables.filter((variable) => !variables.includes(variable));

	if (missingVariables.length > 0) {
		log(new ValidationError(`Missing variables: ${missingVariables.join(', ')}`, node.path, node.positions), 'error', options);
		return false;
	}

	const unusedVariables = variables.filter((variable) => !sourceVariables.includes(variable));

	if (unusedVariables.length > 0) {
		log(new ValidationError(`Unused variables: ${unusedVariables.join(', ')}`, node.path, node.positions), 'error', options);
		return false;
	}

	return true;
};
