// eslint-disable-next-line id-length
const t = (key: string, _variables?: Record<string, string>) => key;

t('a:Hello world');

const a = 'a:b';

t(a);

t("'b'");

t(`ab`);

console.log(t(`a:${a}`));

const b = 'b';

t('Hello world', { name: 'John Doe', b });

// Hi
// i18n-validate-disable-next-line custom fn
t('ok');

/* i18n-validate-disable-next-line custom fn */
t('ok');

t(`a:${b}`);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
t(true ? 'first' : 'second');

t(`a:${'b'}k`);

// eslint-disable-next-line no-useless-concat
t('a' + 'b');
