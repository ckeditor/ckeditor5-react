Changelog
=========

## [6.1.0](https://github.com/ckeditor/ckeditor5-react/compare/v6.0.0...v6.1.0) (2023-06-27)

### Features

* Added the `disableWatchdog` property to the `<CKEditor>` component that allows disabling integration with [the watchdog feature](https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html). Closes [ckeditor/ckeditor5-react#373](https://github.com/ckeditor/ckeditor5-react/issues/373). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/3fa02f4a1d9a6419f8d969a6b2cffad143ee7ee4))


## [6.0.0](https://github.com/ckeditor/ckeditor5-react/compare/v5.1.0...v6.0.0) (2023-04-07)

### BREAKING CHANGES

* Due to rewriting to TypeScript, the component requires CKEditor 5 typings that are available in version 37 or higher. See ckeditor/ckeditor5#11704.
* Upgraded the minimal versions of Node.js to `16.0.0` due to the end of LTS.

### Features

* Migrate package to TypeScript. Closes [ckeditor/ckeditor5#13542](https://github.com/ckeditor/ckeditor5/issues/13542). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/4f6c3831a2c948b3fe1484b19d67b9013a3f0595))

### Other changes

* Updated the required version of Node.js to 16. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/8dbce7c9d8398f66b51507016fd73c9777bee856))
* Changed the package entry point file name from `ckeditor.js` to `index.js`. The structure of the `dist/` directory looks like `src/`. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/4f6c3831a2c948b3fe1484b19d67b9013a3f0595))


## [6.0.0-alpha.0](https://github.com/ckeditor/ckeditor5-react/compare/v5.1.0...v6.0.0-alpha.0) (2023-03-29)

### BREAKING CHANGES

* Due to rewriting to TypeScript, the component requires CKEditor 5 typings that are available in version 37 or higher. See ckeditor/ckeditor5#11704.
* Upgraded the minimal versions of Node.js to `16.0.0` due to the end of LTS.

### Features

* Migrate package to TypeScript. Closes [ckeditor/ckeditor5#13542](https://github.com/ckeditor/ckeditor5/issues/13542). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/4f6c3831a2c948b3fe1484b19d67b9013a3f0595))

### Other changes

* Updated the required version of Node.js to 16. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/8dbce7c9d8398f66b51507016fd73c9777bee856))
* Changed the package entry point file name from `ckeditor.js` to `index.js`. The structure of the `dist/` directory looks like `src/`. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/4f6c3831a2c948b3fe1484b19d67b9013a3f0595))

## [5.1.0](https://github.com/ckeditor/ckeditor5-react/compare/v5.0.6...v5.1.0) (2023-02-23)

### Features

* Added the `watchdogConfig` property that allows defining configuration for the [Watchdog](https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html) feature. Closes [#360](https://github.com/ckeditor/ckeditor5-react/issues/360). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/beea3969f5724ccf2cd144744be9a36c2e3b9d91))


## [5.0.6](https://github.com/ckeditor/ckeditor5-react/compare/v5.0.5...v5.0.6) (2023-01-09)

### Bug fixes

* Fixed destroy process of a single editor instance working within Context. Closes [#354](https://github.com/ckeditor/ckeditor5-react/issues/354). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/446a76be2821046d619e7171bfb5555db2dbecf8))


## [5.0.5](https://github.com/ckeditor/ckeditor5-react/compare/v5.0.4...v5.0.5) (2022-12-22)

### Bug fixes

* Addes a missing postinstall script to published files. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/d0a21f200bc746ee4396308706010e911d059313))


## [5.0.4](https://github.com/ckeditor/ckeditor5-react/compare/v5.0.3...v5.0.4) (2022-12-22)

### Bug fixes

* The `<CKEditor>` component does not emit an error when destroying the context feature. Closes [#349](https://github.com/ckeditor/ckeditor5-react/issues/349), [#339](https://github.com/ckeditor/ckeditor5-react/issues/339). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/70e0d6514a25d887e8727517c033ddbb45dd4dcb))


## [5.0.3](https://github.com/ckeditor/ckeditor5-react/compare/v5.0.2...v5.0.3) (2022-11-23)

### Bug fixes

* Fixed the component initialization procedure to enforce cleanup completion before subsequent editor initialization. Closes [#321](https://github.com/ckeditor/ckeditor5-react/issues/321), [#338](https://github.com/ckeditor/ckeditor5-react/issues/338). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/fe3a179b8be9d2eb7d69e901d0e4f174c30f3d34))

  Thanks to [@corymharper](https://github.com/corymharper).


## [5.0.2](https://github.com/ckeditor/ckeditor5-react/compare/v5.0.1...v5.0.2) (2022-05-26)

### Other changes

* Upgraded the [`@ckeditor/ckeditor5-watchdog`](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog) package to the latest version. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/c85db21f342d371ee43adc1122b88594c6be0b16))


## [5.0.1](https://github.com/ckeditor/ckeditor5-react/compare/v5.0.0...v5.0.1) (2022-05-18)

### Bug fixes

* Fixed component double rendering in StrictMode. Closes [#294](https://github.com/ckeditor/ckeditor5-react/issues/294). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/b17ddd4e7b6d0b3e51a1b52fc8f828cf51c8639c))


## [5.0.0](https://github.com/ckeditor/ckeditor5-react/compare/v4.0.1...v5.0.0) (2022-04-12)

### BREAKING CHANGES

* Due to introducing the lock mechanism for the `Editor#isReadOnly` property, the `<CKEditor>` component uses the new way of enabling the read-only mode in the editor. The component requires an instance of CKEditor 5 in version 34 or higher. See [ckeditor/ckeditor5#10496](https://github.com/ckeditor/ckeditor5/issues/10496).

### Other changes

* Aligned the `<CKEditor>` component API to use the new lock mechanism when enabling/disabling the read-only mode. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/df734432610aef9483bd676a0445fe7c3f662cf8))


## [4.0.1](https://github.com/ckeditor/ckeditor5-react/compare/v4.0.0...v4.0.1) (2022-04-01)

### Other changes

* Bumped Karma test runner to v6.x. Closes [#292](https://github.com/ckeditor/ckeditor5-react/issues/292). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/5071381bcbe0e94f8e1aee9fa092263f1df7a00b))
* Support for React 18. Closes [#297](https://github.com/ckeditor/ckeditor5-react/issues/297). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/1eafc295e5c9832b52ead152171f02810b7ba7a5))


## [4.0.0](https://github.com/ckeditor/ckeditor5-react/compare/v3.0.3...v4.0.0) (2022-02-09)

### BREAKING CHANGES

* Upgraded the minimal versions of Node.js to `14.0.0` due to the end of LTS.

### Bug fixes

* Use `async/await` in `CKEditorContext#_destroyContext()` to handle context destruction properly. Closes [#283](https://github.com/ckeditor/ckeditor5-react/issues/283). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/af2cdba407280834ecd3369fda5b7665340d58fa))

### Other changes

* Updated the required version of Node.js to 14. See [ckeditor/ckeditor5#10972](https://github.com/ckeditor/ckeditor5/issues/10972). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/dcb0c8f92e08065443a5caa4cb7440d55dd0f26e))


## [3.0.3](https://github.com/ckeditor/ckeditor5-react/compare/v3.0.2...v3.0.3) (2021-10-05)

Internal changes only (updated dependencies, documentation, etc.).


## [3.0.2](https://github.com/ckeditor/ckeditor5-react/compare/v3.0.1...v3.0.2) (2021-03-08)

### Bug fixes

* Make sure that the watchdog instance exists before destroying itself. Closes [#197](https://github.com/ckeditor/ckeditor5-react/issues/197). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/4ced4a87d132d0a4ff8f6606af8c58625ab0e78d))


## [3.0.1](https://github.com/ckeditor/ckeditor5-react/compare/v3.0.0...v3.0.1) (2021-02-09)

### Other changes

* Added `React@^17` as allowed version in `peerDependencies`. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/33f33b4034b505f15a80028e71bb50f3b1735bdc))


## [3.0.0](https://github.com/ckeditor/ckeditor5-react/compare/v2.1.0...v3.0.0) (2020-10-28)

### BREAKING CHANGES

* The `onInit` property was renamed to `onReady` and can be called multiple times (after the initialization and after the component is ready when an error occurred).
* The [entry point](https://github.com/ckeditor/ckeditor5-react/blob/master/src/index.js) of the package has changed. The default import was removed since the package provides more than a single component now. Use

    ```js
    import { CKEditor } from '@ckeditor/ckeditor5-react';
    ```

    instead of

    ```js
    import CKEditor from '@ckeditor/ckeditor5-react';
    ```

### Features

* Support for the [`config.initialData`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html#member-initialData) option in the configuration object when creating the `<CKEditor>` component. When passing the `[data]` property and the `initialData` value in the configuration object, the later one will take precedence and a warning message will be logged on the console. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/50fdb6110b43ebab81024c78e47e5ad923383f97))
* The `<CKEditor>` component contains the built-in [watchdog](https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html) feature. Closes [#118](https://github.com/ckeditor/ckeditor5-react/issues/118). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/ac0ff10df4923a33cd186d87dbbea7ddfcf35363))
* Introduced the `<CKEditorContext>` component that supports the [context](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/context-and-collaboration-features.html) feature. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/ac0ff10df4923a33cd186d87dbbea7ddfcf35363))
* Added the `id` property which is used to distinguish different documents. When this property changes, the component restarts the underlying editor instead of setting data on it, which allows e.g. for switching between collaboration documents and fixes a couple of issues (e.g. the `onChange` event no longer fires during changing the document). Closes [#168](https://github.com/ckeditor/ckeditor5-react/issues/168), [#169](https://github.com/ckeditor/ckeditor5-react/issues/169). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/ac0ff10df4923a33cd186d87dbbea7ddfcf35363))
* The `onError()` callback will be called with two arguments. The first one will be an error object (as it was before the release 3+). A second argument is an object that contains two properties:. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/ac0ff10df4923a33cd186d87dbbea7ddfcf35363))

    * `{String} phase`: `'initialization'|'runtime'` - Informs when the error has occurred (during the editor/context initialization or after the initialization).
    * `{Boolean} willEditorRestart` - When `true`, it means that the editor component will restart itself.
    * `{Boolean} willContextRestart` - When `true`, it means that the context component will restart itself.

      The `willEditorRestart` property will not appear when the error has occurred in the context feature.
      The `willContextRestart` property will not appear when the error has occurred in the editor.

Both components (`<CKEditor>` and `<CKEditorContext>`) will internally use the [`Watchdog`](https://ckeditor.com/docs/ckeditor5/latest/api/module_watchdog_watchdog-Watchdog.html) class that restarts the [editor](https://ckeditor.com/docs/ckeditor5/latest/api/module_watchdog_editorwatchdog-EditorWatchdog.html) or [context](https://ckeditor.com/docs/ckeditor5/latest/api/module_watchdog_contextwatchdog-ContextWatchdog.html) when an error occurs.


## [2.1.0](https://github.com/ckeditor/ckeditor5-react/compare/v2.0.0...v2.1.0) (2020-01-16)

### Features

* Introduced support for `onError` callback that is being called if an error occurred during the editor's initialization. Closes [#123](https://github.com/ckeditor/ckeditor5-react/issues/123). ([becf9f7](https://github.com/ckeditor/ckeditor5-react/commit/becf9f7))

  Thanks to [@ansorensen](https://github.com/ansorensen).


## [2.0.0](https://github.com/ckeditor/ckeditor5-react/compare/v1.1.3...v2.0.0) (2019-11-22)

### Other changes

* `<CKEditor>` React component will be distributed in ES6 instead of ES5. Closes [#105](https://github.com/ckeditor/ckeditor5-react/issues/105). ([ec34041](https://github.com/ckeditor/ckeditor5-react/commit/ec34041))
* Removed the BrowserStack integration from this repository. See [ckeditor/ckeditor5#1742](https://github.com/ckeditor/ckeditor5/issues/1742). ([2379fbf](https://github.com/ckeditor/ckeditor5-react/commit/2379fbf))

### BREAKING CHANGE

* `<CKEditor>` React component is now distributed in ES6 instead of ES5. See [#105](https://github.com/ckeditor/ckeditor5-react/issues/105).


## [1.1.3](https://github.com/ckeditor/ckeditor5-react/compare/v1.1.2...v1.1.3) (2019-04-01)

### Bug fixes

* The `<CKEditor>` component will not update anything until it is not ready. Closes [#83](https://github.com/ckeditor/ckeditor5-react/issues/83). ([63cb97d](https://github.com/ckeditor/ckeditor5-react/commit/63cb97d))


## [1.1.2](https://github.com/ckeditor/ckeditor5-react/compare/v1.1.1...v1.1.2) (2019-03-26)

### Bug fixes

* The `<CKEditor>` component will not be updated by the `React` itself. The editor won't freeze if the `#data` property was specified as a static string. Closes [#75](https://github.com/ckeditor/ckeditor5-react/issues/75). Closes [#78](https://github.com/ckeditor/ckeditor5-react/issues/78). ([bdb2ce3](https://github.com/ckeditor/ckeditor5-react/commit/bdb2ce3))


## [1.1.1](https://github.com/ckeditor/ckeditor5-react/compare/v1.1.0...v1.1.1) (2019-02-28)

### Bug fixes

* Fixed integration with collaboration features by changing the way how the initial data are passed to an editor instance. Previously the `<ckeditor>` component had been using the `editor.setData()` method which produces invalid results in collaboration. Now the initial data are injected directly into the container on which the editor will be created. Closes [#68](https://github.com/ckeditor/ckeditor5-react/issues/68). ([1c93b3e](https://github.com/ckeditor/ckeditor5-react/commit/1c93b3e))

### Other changes

* Added minimal versions of Node and npm. See: [ckeditor/ckeditor5#1507](https://github.com/ckeditor/ckeditor5/issues/1507). ([7b1777c](https://github.com/ckeditor/ckeditor5-react/commit/7b1777c))


## [1.1.0](https://github.com/ckeditor/ckeditor5-react/compare/v1.0.0...v1.1.0) (2018-11-29)

### Features

* Introduced `onFocus` and `onBlur` properties to the `<CKEditor>` component. Closes [#49](https://github.com/ckeditor/ckeditor5-react/issues/49). ([97d05c9](https://github.com/ckeditor/ckeditor5-react/commit/97d05c9))
* Introduced the `disabled` property which allows switching the editor to the read-only mode. Closes [#53](https://github.com/ckeditor/ckeditor5-react/issues/53). ([6765006](https://github.com/ckeditor/ckeditor5-react/commit/6765006))

### Bug fixes

* Prevented an infinite loop when the `data` property is missing. Closes [#39](https://github.com/ckeditor/ckeditor5-react/issues/39). ([e16430a](https://github.com/ckeditor/ckeditor5-react/commit/e16430a))


## [1.0.0](https://github.com/ckeditor/ckeditor5-react/compare/v1.0.0-beta.1...v1.0.0) (2018-10-09)

Internal changes only (updated dependencies, documentation, etc.).


## [1.0.0-beta.1](https://github.com/ckeditor/ckeditor5-react/tree/v1.0.0-beta.1) (2018-07-26)

First developer preview. It contains a ready-to-use `<CKEditor>` component that allows using CKEditor 5 Builds and CKEditor 5 Framework in React applications.
