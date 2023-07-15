import { main } from '../src/index.js';

describe('Tests', () => {
	test('should pass', () => {
		expect(main()).toBe('this builds and pushes');
	});
});
