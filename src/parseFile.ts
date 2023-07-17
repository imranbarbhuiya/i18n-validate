import ts from 'typescript';

import type { OptionsWithDefault } from './parseOptionsFile.js';

export interface TranslationNode {
	isStaticKey: boolean;
	key: string;
	namespace: string;
	path: string;
	positions: {
		end: {
			col: number;
			line: number;
		};
		start: {
			col: number;
			line: number;
		};
	};
	variables: string[];
}

export const parseFile = (filePath: string, options: OptionsWithDefault) => {
	const sourceFile = ts.createSourceFile(filePath, ts.sys.readFile(filePath) ?? '', ts.ScriptTarget.ESNext, true);

	const nodes: TranslationNode[] = [];

	const fullText = sourceFile.getFullText();

	const topLevelComments = ts
		.getLeadingCommentRanges(fullText, sourceFile.getFullStart())
		?.filter((comment) => comment.kind === ts.SyntaxKind.MultiLineCommentTrivia);

	if (topLevelComments) {
		const comment = topLevelComments.map((topLevelComment) => fullText.slice(topLevelComment.pos, topLevelComment.end));

		const ignoreFile = comment.find((comment) => /^\/\*(?:\s+)?i18n-validate-disable(?:\s.*)?\*\/$/.exec(comment.trim()));

		if (ignoreFile) return nodes;
	}

	const visit = (node: ts.Node) => {
		if (ts.isCallExpression(node) && options.functions.includes(node.expression.getText(sourceFile))) {
			const ignoreFunction = node
				.getFullText(sourceFile)
				.split('\n')
				.find((line) => /^(?:\/\/|\/\*)(?:\s+)?i18n-validate-disable-next-line(?:\s.*)?(?:\*\/)?$/.test(line.trim()));

			if (ignoreFunction) return;

			const [firstArg, secondArg] = node.arguments;

			/* eslint-disable @typescript-eslint/no-unnecessary-condition */
			const keyWithNamespace = firstArg?.getText(sourceFile);

			const isStaticKey =
				keyWithNamespace?.startsWith("'") ||
				keyWithNamespace?.startsWith('"') ||
				(keyWithNamespace?.startsWith('`') && !keyWithNamespace?.includes('${'));

			const [namespace, key] = isStaticKey ? keyWithNamespace?.slice(1, -1).split(options.nsSeparator) ?? [keyWithNamespace, ''] : ['', ''];

			let variables: string[] = [];
			if (secondArg && ts.isObjectLiteralExpression(secondArg)) {
				variables = secondArg.properties.map((prop) => {
					if (prop.name) {
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
						col: start.character,
						line: start.line + 1
					},
					end: {
						col: end.character,
						line: end.line + 1
					}
				},
				variables,
				isStaticKey
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);

	return nodes;
};
