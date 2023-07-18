import core from '@actions/core';
import github from '@actions/github';

try {
	const include = core.getInput('include');
	const exclude = core.getInput('exclude');

	console.log(`include: ${include}`);
	console.log(`exclude: ${exclude}`);

	const payload = JSON.stringify(github.context.payload, undefined, 2);
	console.log(`The event payload: ${payload}`);
} catch (_error) {
	const error = _error as Error;

	core.setFailed(error);
}
