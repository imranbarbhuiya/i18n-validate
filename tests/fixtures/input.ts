// eslint-disable-next-line id-length
const t = (key: string, _variables?: Record<string, string>) => key;

t('a:Hello world');

const a = 'a:b';

t(a);

t(`a:${a}`);

const b = 'b';

t('Hello world', { name: 'John Doe', b });

// i18n-validate-disable-next-line custom fn
t('ok');
