import type { LogLevel, OptionsWithDefault } from './parseOptionsFile.js';

const logLevels = ['debug', 'info', 'warn', 'error'] as const;

const errorPrefix = '\u001B[31m[ERROR]\u001B[0m';
const warnPrefix = '\u001B[33m[WARN]\u001B[0m';
const infoPrefix = '\u001B[34m[INFO]\u001B[0m';
const debugPrefix = '[DEBUG]';

export const log = (
	message: any,
	_type: 'debug' | 'error' | 'info' | 'invalidKey' | 'missingVariable' | 'unusedVariable' | 'warn',
	options: OptionsWithDefault
) => {
	let type = _type as LogLevel;

	if (_type === 'invalidKey')
		if (options.errorOnInvalidKey) type = 'error';
		else type = 'warn';

	if (_type === 'missingVariable')
		if (options.errorOnMissingVariable) type = 'error';
		else type = 'warn';

	if (_type === 'unusedVariable')
		if (options.errorOnUnusedVariable) type = 'error';
		else type = 'warn';

	if (logLevels.indexOf(type) < logLevels.indexOf(options.logLevel)) return;

	if (type === 'error') {
		console.error(
			errorPrefix,
			message
			// ['invalidKey', 'missingVariable'].includes(_type)
			// 	? '\n\nIf you want to ignore this error, add the following comment in your code:\n\u001B[33m// i18n-validate-disable-next-line\u001B[0m'
			// 	: ''
		);
		return;
	}

	if (type === 'warn') {
		console.warn(warnPrefix, message);
		return;
	}

	if (type === 'info') {
		console.log(infoPrefix, message);
		return;
	}

	console.log(debugPrefix, message);
};
