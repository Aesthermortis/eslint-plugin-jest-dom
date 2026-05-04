# Changelog

## [6.0.0](https://github.com/Aesthermortis/eslint-plugin-jest-dom/compare/v5.5.0...v6.0.0) (2026-05-04)


### ⚠ BREAKING CHANGES

* **configs:** plugin.configs.all is no longer exported. Use plugin.configs.recommended instead.
* **core:** removes legacy flat/* and .eslintrc compatibility paths and now requires Node.js 24+, npm 11+, and ESLint 10.

### 🌟 Features

* **config:** add config names and plugin namespace ([bc8971c](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/bc8971c8e28554c5b7da8ce9a7a7772c307e0ecc))
* **core:** migrate plugin to ESM and flat config ([5411f0b](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/5411f0bdb9351afcfe1398ccc35c82519452d72d))


### 🩹 Fixes

* **config:** apply Jest lint config to tests ([bb2f972](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/bb2f9722f039b13751aec3a575b3798dc1df654a))
* **prefer-class:** handle toBeTrue autofix ([7e2587b](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/7e2587b38e50b32bbb3835205df5102059e39b22))
* **prefer-style:** anchor matcher selectors ([92abd0b](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/92abd0bf82f3faaa676df0b5d7173de776bb3463))
* **prefer-style:** report identifier values ([8067205](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/806720517845ea0ab5568fb92b719654ba52ebfb))
* **prefer-text:** preserve exact text assertions ([560aa7c](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/560aa7c379b8ec0060dd9f75d3f42c26c52b0866))


### 📚 Documentation

* **conduct:** update contributor covenant ([84827c1](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/84827c104bff32a999d70fb806ca720978aaf52c))
* **empty:** document non-empty argument helper ([24ceb84](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/24ceb84464e61f07fc4b959d52f18adcfc5e70bf))
* **readme:** remove generated contributors table ([b42d762](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/b42d762ceae7cb57e079d2fce2aa2a945d7e1235))
* **release:** add languages to manual release blocks ([88e2200](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/88e2200d51cf72231682918bbc5a13de0ed23d88))
* **repo:** clean contribution and install notes ([518fde3](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/518fde3c929e849f20ca4884e8a362d0aeb5ca3b))


### 🧹 Chores

* **api:** make default export the root entrypoint ([fcf484d](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/fcf484d60614fde2355b92fcb05642b420171a5d))
* **ast:** avoid mutating assignment references ([1a993f0](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/1a993f06e8390ba366cc0691df9919fb7a068bc5))
* **attributes:** extract banned matcher predicates ([f009768](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/f00976802a79a7f7d6aec82c5f2903792aca60e9))
* **attributes:** use explicit rule imports ([f85e35d](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/f85e35d9df1b8f7abe17e6bd9320db9b0c7c9f4e))
* **configs:** remove all config export ([5646197](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/5646197a6ef9a185b3d2f61eddfdc833946da508))
* **context:** cover ESLint API fallbacks ([721fcb8](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/721fcb80cfc3e23aac47ee9f18e711c54cc9e754))
* **context:** remove redundant Jest globals ([bec394e](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/bec394ec4583ffb83d04fc85ea399884693d3a61))
* **document:** clean prefer-in-document cases ([ce1ba39](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/ce1ba39d8c2c11c5cd932fad043eec61820eb9c1))
* **document:** satisfy matcher lint rules ([833cf93](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/833cf931cebed9b02d079ec9a18636702732911e))
* **fixtures:** name banned attribute case factory ([e409f45](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/e409f4562b3d446e29c3027a6b423ea5a251b14b))
* **queries:** use non-mutating sorted copies ([8af65c9](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/8af65c90895c688e542235619e85fe65ab417ed2))
* **repo:** point metadata and ci to fork owner ([25103e5](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/25103e5516d216d6646418e4d7b095edcb4089c8))
* **tests:** split flat config conversion ([e63c8f9](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/e63c8f9cc59cf5fbbd4837358fd28dae53bbd2de))
* **tooling:** expand local quality tooling ([b484441](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/b4844418e34b613bddc1b1b9bcbf539a4a27e21f))
* **value:** use test for role query matching ([bf94495](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/bf944959757241c78f98f584dc03d66519827014))


### 🤖 Automation

* **packaging:** add build hooks for git-based installs ([7607648](https://github.com/Aesthermortis/eslint-plugin-jest-dom/commit/7607648dea288ecea2a966cf9e350de136dd99b5))
