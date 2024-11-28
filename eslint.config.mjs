import common from 'eslint-config-mahir/common';
import node from 'eslint-config-mahir/node';
import typescript from 'eslint-config-mahir/typescript';

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
export default [
	...common,
	...node,
	...typescript,
	{
		ignores: ['node_modules/', '.github', '.yarn', '**/dist']
	}
];
