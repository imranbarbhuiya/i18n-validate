import { join } from 'node:path';
import process from 'node:process';

import { ValidationError } from './Error.js';
import { log } from './logger.js';
import { type TranslationNode } from './parseFile.js';

import type { OptionsWithDefault } from './parseOptionsFile.js';

const importedFiles = new Map<string, Promise<Record<string, unknown>>>();

const importLocaleFile = async (url: string) => {
	if (importedFiles.has(url)) return importedFiles.get(url)!;

	const promise = import(url, {
		assert: {
			type: 'json'
		}
	});

	importedFiles.set(url, promise);

	return promise;
};

export const validateKey = async (node: TranslationNode, options: OptionsWithDefault) => {
	const filePath = `${options.localeFolder}/${options.localePath.replaceAll('{{lng}}', options.sourceLang).replaceAll('{{ns}}', node.namespace)}`;

	log(`Fetching translation keys from ${filePath}`, 'debug', options);

	const url = join(process.cwd(), filePath).replaceAll('\\', '/');

	const { default: json }: { default: Record<string, unknown> } = await importLocaleFile(`file://${url}`).catch(() => ({
		default: {}
	}));

	const key = node.key;

	const value = (
		key.includes(options.keySeparator)
			? key.split(options.keySeparator).reduce((acc, cur) => acc[cur] as Record<string, unknown>, json)
			: json[key]
	) as string;

	if (!value) {
		log(new ValidationError('Invalid translation key', node.path, node.positions), 'error', options);

		return false;
	}

	const variables = node.variables;

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
