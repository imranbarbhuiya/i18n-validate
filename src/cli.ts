#!/usr/bin/env node

import process from 'node:process';

import { Command } from 'commander';
import { Glob } from 'glob';

import { ValidationError } from './Error.js';
import { log } from './logger.js';
import { parseOptionsFile } from './parseOptionsFile.js';
import { parseFile } from './parser.js';

const command = new Command()
	.version('[VI]{{inject}}[/VI]')
	.usage('[options] <file ...>')
	.option('-c, --config <config>', 'Path to the config file', './i18n-validate.json');

command.on('--help', () => {
	console.log('');
	console.log('  Examples:');
	console.log('');
	console.log('    $ i18next-validate "/path/to/src/app.js"');
	console.log("    $ i18next-validate --config i18n-validate-custom.json 'src/**/*.{js,jsx}'");
	console.log('');
});

const program = command.parse(process.argv);
const options = await parseOptionsFile(program.opts());

options.inputs = program.args.length > 0 ? program.args : options.inputs;

if (!Array.isArray(options.inputs)) options.inputs = [options.inputs];

options.inputs = options.inputs
	.map((_input) => {
		let input = _input.trim();

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

const glob = new Glob(options.inputs, {});

for await (const file of glob) {
	const nodes = parseFile(file, options);
	console.log(nodes);

	if (nodes.length) log(new ValidationError('Missing translation key', nodes[0].path, nodes[0].positions), 'invalidKey', options);
}

// @ts-expect-error- ok
// ok
t('test', {
	foo: 'bar'
});
