Changelog
=========

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
