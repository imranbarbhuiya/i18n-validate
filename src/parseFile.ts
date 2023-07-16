import ts from 'typescript';

import type { OptionsWithDefault } from './parseOptionsFile.js';

export interface TranslationNode {
	key: string;
	namespace: string;
	path: string;
	positions: {
		end: {
			character: number;
			line: number;
		};
		start: {
			character: number;
			line: number;
		};
	};
	variables: string[];
}

export const parseFile = (filePath: string, options: OptionsWithDefault) => {
	const sourceFile = ts.createSourceFile(filePath, ts.sys.readFile(filePath) ?? '', ts.ScriptTarget.ESNext, true);

	const nodes: TranslationNode[] = [];

	// TODO: Add support for ignoreFile
	// const ignoreFile = sourceFile
	// 	.getFullText(sourceFile)
	// 	.split('\n')
	// 	.filter((line) => line.startsWith('use ') || !line.trim())
	// 	.reduce<string[]>((acc, line) => {
	// 		if (!line.startsWith('//')) {
	// 			return acc;
	// 		}

	// 		return [...acc, line];
	// 	}, [])
	// 	.find((line) => line.includes('i18n-validate-disable-file'));
	// if (ignoreFile) return nodes;

	const visit = (node: ts.Node) => {
		if (ts.isCallExpression(node) && options.functions.includes(node.expression.getText(sourceFile))) {
			const ignoreFunction = node
				.getFullText(sourceFile)
				.split('\n')
				.find((line) => line.includes('i18n-validate-disable-next-line'));

			if (ignoreFunction) return;

			const [firstArg, secondArg] = node.arguments;

			/* eslint-disable @typescript-eslint/no-unnecessary-condition */
			const keyWithNamespace = firstArg?.getText(sourceFile);

			const [key, namespace] = keyWithNamespace?.split(options.nsSeparator) ?? [keyWithNamespace, ''];

			let variables: string[] = [];
			if (secondArg && ts.isObjectLiteralExpression(secondArg)) {
				variables = secondArg.properties.map((prop) => {
					if (ts.isPropertyAssignment(prop)) {
						return prop.name.getText(sourceFile);
					}

					return '';
				});
			}
			/* eslint-enable @typescript-eslint/no-unnecessary-condition */

			const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
			const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());

			nodes.push({
				key,
				namespace: options.nsFolderSeparator === '/' ? namespace : namespace.replaceAll(options.nsFolderSeparator, '/'),
				path: filePath,
				positions: {
					start: {
						character: start.character,
						line: start.line + 1
					},
					end: {
						character: end.character,
						line: end.line + 1
					}
				},
				variables
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);

	return nodes;
};
