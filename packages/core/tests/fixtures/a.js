/* eslint-disable id-length */

const b = '';

/**
 * @type {'namespace:key5' | 'namespace:key6'}
 */
const d = `a:${b}`;

t(d);

const e = /** @type {'namespace:key7' | 'namespace:key8'} */ (`a:${b}`);

t(e);
