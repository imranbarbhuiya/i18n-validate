<div align="center">

# i18n-validate

**A github action to find invalid i18n keys, missing variables and many more using i18n-validate.**

[![GitHub](https://img.shields.io/github/license/imranbarbhuiya/i18n-validate)](https://github.com/imranbarbhuiya/i18n-validate/blob/main/LICENSE)

<!-- [![npm](https://img.shields.io/npm/v/i18n-validate?color=crimson&logo=npm&style=flat-square)](https://www.npmjs.com/package/i18n-validate) -->

</div>

## Features

-   Provides problem matcher for GitHub Actions
-   Fully customizable
-   Easy to use

## Usage

```yml
name: i18n-validate

on:
    push:
        branches:
            - main

jobs:
    Validate:
        name: Validate i18n keys
        runs-on: ubuntu-latest
        steps:
            - name: Checkout Project
              uses: actions/checkout@v3.5.3
            - name: Validate i18n keys
              uses: imranbarbhuiya/i18n-validate@v0.0.1
              with:
                  include: 'src/**/*.js'
```

## Configuration

<!-- TODO: add later -->

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
