#!/usr/bin/env node

import process from 'node:process';

import { Command } from 'commander';
import { Glob } from 'glob';

import { ValidationError } from './Error.js';
import { log } from './logger.js';
import { parseFile } from './parseFile.js';
import { parseOptionsFile } from './parseOptionsFile.js';
import { validateKey } from './validateKey.js';

const command = new Command()
	.version('[VI]{{inject}}[/VI]')
	.usage('[options] <file ...>')
	.option('-c, --config <config>', 'Path to the config file', './i18n-validate.json')
	.option('--log-level <logLevel>', 'Log level', 'info')
	.option('--exclude <exclude...>', 'Exclude files from parsing', '**/node_modules/**')
	.option('--exit-on-error', 'Exit immediately if an error is found', false);

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

for await (const file of glob) {
	log(`Parsing ${file}`, 'debug', options);
	const translationNodes = parseFile(file, options);

	for (const node of translationNodes) {
		if (!node.isStaticKey) {
			log(new ValidationError('Dynamic keys are not supported yet. Skipping', node.path, node.positions), 'warn', options);
		} else if (!node.key || !node.namespace) {
			log(new ValidationError('Missing translation key or namespace', node.path, node.positions), 'error', options);
			errorCount++;
		} else {
			const valid = await validateKey(node, options);
			if (!valid) errorCount++;
		}
	}
}

if (errorCount > 0) {
	log(`Found ${errorCount} errors`, 'error', options);
	process.exit(1);
} else {
	log(`Found ${errorCount} errors`, 'info', options);
	process.exit(0);
}
