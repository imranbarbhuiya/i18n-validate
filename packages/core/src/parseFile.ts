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

const sourceFiles = new Map<string, ts.SourceFile>();

const getSourceFile = (filePath: string) => {
	if (sourceFiles.has(filePath)) return sourceFiles.get(filePath)!;

	const sourceFile = ts.createSourceFile(filePath, ts.sys.readFile(filePath) ?? '', ts.ScriptTarget.ESNext, true);
	sourceFiles.set(filePath, sourceFile);

	return sourceFile;
};

const typecheckerMap = new Map<string, ts.TypeChecker>();

const getTypeChecker = (filePath: string) => {
	if (typecheckerMap.has(filePath)) return typecheckerMap.get(filePath)!;

	const typechecker = ts
		.createProgram([filePath], {
			checkJs: ['.js', '.jsx'].some((ext) => filePath.endsWith(ext))
		})
		.getTypeChecker();
	typecheckerMap.set(filePath, typechecker);

	return typechecker;
};

export const parseFile = (filePath: string, options: OptionsWithDefault) => {
	const sourceFile = getSourceFile(filePath);

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
			const firstArgText = firstArg?.getText(sourceFile);

			const isStaticKey = firstArg && (ts.isStringLiteral(firstArg) || ts.isNoSubstitutionTemplateLiteral(firstArg));

			const keyWithNamespaces = [];

			if (isStaticKey) keyWithNamespaces.push(firstArgText);

			if (
				firstArg &&
				(ts.isTemplateExpression(firstArg) ||
					ts.isIdentifier(firstArg) ||
					ts.isAsExpression(firstArg) ||
					ts.isParenthesizedExpression(firstArg))
			) {
				const typeChecker = getTypeChecker(filePath);
				try {
					const firstArgType = typeChecker.getTypeAtLocation(firstArg);

					if (firstArgType.isStringLiteral()) {
						keyWithNamespaces.push(firstArgType.value);
					} else if (firstArgType.isUnion() && firstArgType.types.every((type) => type.isStringLiteral())) {
						keyWithNamespaces.push(...firstArgType.types.map((type) => typeChecker.typeToString(type)));
					}
				} catch {
					// can't get type of firstArg, so ignore it
				}
			}

			// TODO: add support for dynamic keys here
			if (firstArg && ts.isBinaryExpression(firstArg)) {
				const children = firstArg.getChildren(sourceFile).filter((child) => !ts.isBinaryOperatorToken(child));
				const isStaticKey = children.every((child) => ts.isStringLiteral(child) || ts.isNoSubstitutionTemplateLiteral(child));

				const keyWithNamespace = children.map((child) => child.getText(sourceFile).slice(1, -1)).join('');

				if (isStaticKey) {
					keyWithNamespaces.push(keyWithNamespace);
				}
			}

			// TODO: add support for dynamic keys here
			if (firstArg && ts.isConditionalExpression(firstArg)) {
				const possibleValues = firstArg
					.getChildren(sourceFile)
					.filter((child) => ts.isStringLiteral(child) || ts.isNoSubstitutionTemplateLiteral(child))
					.map((child) => child.getText(sourceFile));

				if (possibleValues.length) keyWithNamespaces.push(...possibleValues);
			}

			if (keyWithNamespaces.length) {
				for (const keyWithNamespace of keyWithNamespaces) {
					if (!keyWithNamespace) continue;

					const [namespace, key] = keyWithNamespace?.slice(1, -1).split(options.nsSeparator) ?? [keyWithNamespace, ''];

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
								col: start.character + 1,
								line: start.line + 1
							},
							end: {
								col: end.character + 1,
								line: end.line + 1
							}
						},
						variables,
						isStaticKey: true
					});
				}
			} else {
				const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
				const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());

				nodes.push({
					key: firstArgText,
					namespace: '',
					variables: [],
					path: filePath,
					positions: {
						start: {
							col: start.character + 1,
							line: start.line + 1
						},
						end: {
							col: end.character + 1,
							line: end.line + 1
						}
					},
					isStaticKey: false
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);

	return nodes;
};
