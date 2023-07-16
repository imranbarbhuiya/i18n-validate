import ts from 'typescript';

import type { Options } from './parseOptionsFile.js';

export const parseFile = (filePath: string, options: Options) => {
	const sourceFile = ts.createSourceFile(filePath, ts.sys.readFile(filePath) ?? '', ts.ScriptTarget.ESNext, true);

	const nodes: {
		key: string;
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
	}[] = [];

	const visit = (node: ts.Node) => {
		if (ts.isCallExpression(node) && options.functions.includes(node.expression.getText(sourceFile))) {
			const [firstArg, secondArg] = node.arguments;
			const key = firstArg.getText(sourceFile);
			let variables: string[] = [];
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (secondArg && ts.isObjectLiteralExpression(secondArg)) {
				variables = secondArg.properties.map((prop) => {
					if (ts.isPropertyAssignment(prop)) {
						return prop.name.getText(sourceFile);
					}

					return '';
				});
			}

			const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
			const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());

			nodes.push({
				key,
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
