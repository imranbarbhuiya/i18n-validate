#!/usr/bin/env node

import process from 'node:process';

import { Command } from 'commander';
import { Glob } from 'glob';
import isCI from 'is-ci';

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
	.option('--error-on-invalid-key', 'Exit with error code 1 if invalid keys are found', isCI)
	.option('--error-on-missing-variable', 'Exit with error code 1 if missing variables are found', isCI)
	.option('--error-on-unused-variable', 'Exit with error code 1 if unused variables are found', false);

command.on('--help', () => {
	console.log('');
	console.log('  Examples:');
	console.log('');
	console.log('    $ i18next-validate "/path/to/src/app.js"');
	console.log("    $ i18next-validate --config i18n-validate-custom.json 'src/**/*.{js,jsx}'");
	console.log('	 $ i18next-validate --exclude "**/node_modules/**" "src/**/*.{js,jsx}"');
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

if (options.inputs.length === 0) {
	program.help();
	process.exit(1);
}

const glob = new Glob(options.inputs, {
	ignore: options.exclude
});

for await (const file of glob) {
	log(`Parsing ${file}`, 'debug', options);
	const translationNodes = parseFile(file, options);
	console.log(translationNodes);

	for (const node of translationNodes) {
		if (!node.key || !node.namespace)
			log(new ValidationError('Missing translation key or namespace', node.path, node.positions), 'invalidKey', options);

		await validateKey(node, options);
	}
}
