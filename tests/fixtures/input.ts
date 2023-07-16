// eslint-disable-next-line id-length
const t = (key: string, _variables?: Record<string, string>) => key;

t('a:Hello world');

const a = 'a:b';

t(a);

t(`a:${a}`);

t('Hello world', { name: 'John Doe' });

// i18n-validate-disable-next-line custom fn
t('ok');
