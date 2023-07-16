<div align="center">

# i18n-validate

**A cli tool to find invalid i18n keys, missing variables and many more.**

[![GitHub](https://img.shields.io/github/license/imranbarbhuiya/i18n-validate)](https://github.com/imranbarbhuiya/i18n-validate/blob/main/LICENSE)
[![codecov](https://codecov.io/gh/imranbarbhuiya/i18n-validate/branch/main/graph/badge.svg?token=token)](https://codecov.io/gh/imranbarbhuiya/i18n-validate)
[![npm](https://img.shields.io/npm/v/i18n-validate?color=crimson&logo=npm&style=flat-square)](https://www.npmjs.com/package/i18n-validate)

</div>

## Features

-   Written In Typescript
-   Offers CLI and API
-   Full TypeScript & JavaScript support
-   Framework agnostic
-   Supports Pluralization
-   Fully customizable

## Usage

```sh
npx i18n-validate
```

<!-- prettier-ignore-start -->
```sh
Usage: i18n-validate [options] <file ...>

Options:
  -V, --version           output the version number
  -c, --config <config>   Path to the config file (default:
                          "./i18n-validate.json")
  --log-level <logLevel>  Log level (default: "info")
  --exclude <exclude...>  Exclude files from parsing (default:
                          "**/node_modules/**")
  --exit-on-error         Exit immediately if an error is found (default:
                          false)
  -h, --help              display help for command

  Examples:

    $ i18next-validate "/path/to/src/app.js"
    $ i18next-validate --config i18n-validate-custom.json 'src/**/*.{js,jsx}'
    $ i18next-validate --exclude "**/node_modules/**" "src/**/*.{js,jsx}"
```
<!-- prettier-ignore-end -->

You can disable the `i18n-validate` for a specific line by adding `// i18n-validate-disable-next-line` before the line.

> **Note**: Currently, `i18n-validate` only supports `ts`, `tsx`, `js` and `jsx` source files and `json` translation files.

### Use with lint-staged

```json
{
	"lint-staged": {
		"*.{js,jsx,ts,tsx}": ["i18n-validate"]
	}
}
```

## Configuration

You can customize the behavior of `i18n-validate` by adding a `i18n-validate.json` file to the root of your project.

```json
{
	"$schema": "https://raw.githubusercontent.com/imranbarbhuiya/i18n-validate/main/.github/i18n-validate.schema.json"
}
```

> **Note**: You can also use `js`, `cjs` or `mjs` file and with any name you want. Just make sure to pass the path of the config file to `i18n-validate` using `--config` option.

## Buy me some doughnuts

If you want to support me by donating, you can do so by using any of the following methods. Thank you very much in advance!

<a href="https://github.com/sponsors/imranbarbhuiya" target="_blank"><img src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="Buy Me A Coffee" height="41" width="174"></a>
<a href="https://www.buymeacoffee.com/parbez" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
<a href='https://ko-fi.com/Y8Y1CBIJH' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi4.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## Contributors ✨

Thanks goes to these wonderful people:

<a href="https://github.com/imranbarbhuiya/i18n-validate/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=imranbarbhuiya/i18n-validate" />
</a>
