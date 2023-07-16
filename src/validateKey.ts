import { URL } from 'node:url';

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

	return promise as Promise<Record<string, unknown>>;
};

export const validateKey = async (node: TranslationNode, options: OptionsWithDefault) => {
	const filePath = `${options.localeFolder}/${options.sourceLang}/${node.namespace}.json`;

	const url = new URL(filePath, import.meta.url);

	const json = await importLocaleFile(url.toString());

	const key = node.key;

	const value = (
		key.includes(options.keySeparator)
			? key.split(options.keySeparator).reduce((acc, cur) => acc[cur] as Record<string, unknown>, json)
			: json[key]
	) as string;

	if (!value) {
		log(new ValidationError('Invalid translation key', node.path, node.positions), 'invalidKey', options);

		return;
	}

	const variables = node.variables;

	const sourceVariables = value.match(/{{(?<var>.*?)}}/g)?.map((variable) => variable.slice(2, -2)) ?? [];

	const missingVariables = variables.filter((variable) => !sourceVariables.includes(variable));

	if (missingVariables.length > 0) {
		log(new ValidationError(`Missing variables: ${missingVariables.join(', ')}`, node.path, node.positions), 'missingVariable', options);
	}

	const unusedVariables = sourceVariables.filter((variable) => !variables.includes(variable));

	if (unusedVariables.length > 0) {
		log(new ValidationError(`Unused variables: ${unusedVariables.join(', ')}`, node.path, node.positions), 'unusedVariable', options);
	}
};
