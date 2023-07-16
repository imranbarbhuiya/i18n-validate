import type { LogLevel, OptionsWithDefault } from './parseOptionsFile.js';

const logLevels = ['debug', 'info', 'warn', 'error'] as const;

const errorPrefix = '\u001B[31m[ERROR]\u001B[0m';
const warnPrefix = '\u001B[33m[WARN]\u001B[0m';
const infoPrefix = '\u001B[34m[INFO]\u001B[0m';
const debugPrefix = '[DEBUG]';

export const log = (message: any, type: LogLevel, options: OptionsWithDefault) => {
	if (logLevels.indexOf(type) < logLevels.indexOf(options.logLevel)) return;

	if (type === 'error') {
		if (options.exitOnError) throw message;
		else console.error(errorPrefix, message);
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
