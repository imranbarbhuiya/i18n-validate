export class ValidationError extends Error {
	public stack: string;

	public constructor(
		message: string,
		filePath: string,
		positions: {
			end: {
				character: number;
				line: number;
			};
			start: {
				character: number;
				line: number;
			};
		}
	) {
		super(message);

		this.stack = `ValidationError: ${message}\n    at ${filePath}:${positions.start.line}:${positions.start.character}-${positions.end.line}:${positions.end.character}`;
	}
}
