import type { LogLevel, Options } from './parseOptionsFile.js';

const logLevels = ['debug', 'info', 'warn', 'error'] as const;

const errorPrefix = '\u001B[31m[ERROR]\u001B[0m';
const warnPrefix = '\u001B[33m[WARN]\u001B[0m';
const infoPrefix = '\u001B[34m[INFO]\u001B[0m';
const debugPrefix = '[DEBUG]';

export const log = (message: any, _type: 'debug' | 'error' | 'info' | 'invalidKey' | 'missingVariable' | 'warn', options: Options) => {
	let type = _type as LogLevel;

	if (_type === 'invalidKey')
		if (options.throwOnInvalidKeys) {
			type = 'error';
		} else {
			type = 'warn';
		}

	if (_type === 'missingVariable')
		if (options.throwOnMissingVariables) {
			type = 'error';
		} else {
			type = 'warn';
		}

	if (logLevels.indexOf(type) < logLevels.indexOf(options.logLevel)) return;

	if (type === 'error') {
		console.error(errorPrefix, message);
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
