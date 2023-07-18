#!/usr/bin/env node

import process from 'node:process';

import { Command } from 'commander';
import { Glob } from 'glob';

import { ValidationError } from './Error.js';
import { log } from './logger.js';
import { parseFile } from './parseFile.js';
import { parseOptionsFile } from './parseOptionsFile.js';
import { validateKey } from './validateKey.js';

const start = performance.now();

const command = new Command()
	.version('[VI]{{inject}}[/VI]')
	.usage('[options] <file ...>')
	.option('-c, --config <config>', 'Path to the config file', './i18n-validate.json')
	.option('--log-level <logLevel>', 'Log level')
	.option('--exclude <exclude...>', 'Exclude files from parsing')
	.option('--exit-on-error', 'Exit immediately if an error is found');

command.on('--help', () => {
	console.log('');
	console.log('  Examples:');
	console.log('');
	console.log('    $ i18next-validate "/path/to/src/app.js"');
	console.log("    $ i18next-validate --config i18n-validate-custom.json 'src/**/*.{js,jsx}'");
	console.log('    $ i18next-validate --exclude "**/node_modules/**" "src/**/*.{js,jsx}"');
	console.log('');
});

const program = command.parse(process.argv);
const options = await parseOptionsFile(program.opts());

options.inputs = program.args.length > 0 ? program.args : options.inputs;

if (!Array.isArray(options.inputs)) options.inputs = [options.inputs];

options.inputs = options.inputs
	.map((_input) => {
		let input = _input.trim().replaceAll('\\', '/');

		if (/^'.*'$|^".*"$/.test(input)) {
			input = input.slice(1, -1);
		}

		return input;
	})
	.filter(Boolean);

log(`Parsed options:\n${JSON.stringify(options, null, 2)}`, 'debug', options);

if (options.inputs.length === 0) {
	program.help();
	process.exit(1);
}

const glob = new Glob(options.inputs, {
	ignore: options.exclude
});

let errorCount = 0;
let warningCount = 0;
let fileCount = 0;

for await (const file of glob) {
	fileCount++;
	log(`Parsing ${file}`, 'debug', options);
	const translationNodes = parseFile(file, options);

	for (const node of translationNodes) {
		if (!node.isStaticKey) {
			log(
				new ValidationError(node.key ? 'Dynamic keys are not supported yet. Skipping' : 'No key provided', node.path, node.positions),
				'warn',
				options
			);
			warningCount++;
		} else if (node.key && node.namespace) {
			const valid = await validateKey(node, options);
			if (!valid) errorCount++;
		} else {
			log(
				new ValidationError(node.key ? 'Missing translation namespace' : 'Missing translation key', node.path, node.positions),
				'error',
				options
			);
			errorCount++;
		}
	}

	if (errorCount > 0 && options.exitOnError) {
		break;
	}
}

const timeTaken = `${(performance.now() - start).toFixed(2)}ms`;

log(
	`Found ${errorCount + warningCount} issues${
		errorCount || warningCount ? ` (${errorCount} errors and ${warningCount} warnings)` : ''
	}.Validated ${fileCount} in ${timeTaken}`,
	'info',
	options
);

process.exit(errorCount > 0 ? 1 : 0);
