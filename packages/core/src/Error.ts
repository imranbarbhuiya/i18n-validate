import { type TranslationNode } from './parseFile.js';

export class ValidationError extends Error {
	public stack: string;

	public constructor(message: string, filePath: string, positions: TranslationNode['positions']) {
		super(message);

		this.stack = `ValidationError: ${message}\n    at ${filePath}:${positions.start.line}:${positions.start.col}-${positions.end.line}:${positions.end.col}`;
	}
}
