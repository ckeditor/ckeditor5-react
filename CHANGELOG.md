Changelog
=========

## [11.0.1](https://github.com/ckeditor/ckeditor5-react/compare/v11.0.0...v11.0.1) (December 18, 2025)

### Other changes

* Upgrade the development environment to Node v24.11.
* Extend the `ckeditor5` peer dependency range to accept an internal release (`^0.0.0-internal`) in addition to stable and nightly versions. Closes [#637](https://github.com/ckeditor/ckeditor5-react/issues/637).


## [11.0.0](https://github.com/ckeditor/ckeditor5-react/compare/v10.0.0...v11.0.0) (2025-07-09)

### BREAKING CHANGES

* Aligned the component with the latest CKEditor 5 release (`v46.0.0`), adopting the type import names. Starting from this version, previous CKEditor 5 releases are no longer compatible due to breaking changes in definitions and package structure. See [ckeditor/ckeditor5#18583](https://github.com/ckeditor/ckeditor5/issues/18583)

### Features

* Update imports to match CKEditor 5 v46. Closes [#602](https://github.com/ckeditor/ckeditor5-react/issues/602). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/8bfcfa65593af622190fed284d44132e4060fc28))


## [11.0.0-alpha.0](https://github.com/ckeditor/ckeditor5-react/compare/v10.0.0...v11.0.0-alpha.0) (2025-07-02)

### BREAKING CHANGES

* Aligned the component with the latest CKEditor 5 release (`v46.0.0`), adopting the type import names. Starting from this version, previous CKEditor 5 releases are no longer compatible due to breaking changes in definitions and package structure. See [ckeditor/ckeditor5#18583](https://github.com/ckeditor/ckeditor5/issues/18583)

### Features

* Update imports to match CKEditor 5 v46. Closes [#602](https://github.com/ckeditor/ckeditor5-react/issues/602). ([commit](https://github.com/ckeditor/ckeditor5-react/commit/8bfcfa65593af622190fed284d44132e4060fc28))

## [10.0.0](https://github.com/ckeditor/ckeditor5-react/compare/v9.5.0...v10.0.0) (2025-06-25)

### BREAKING CHANGES

* Upgraded the minimal version of Node.js to 20.0.0 due to the end of LTS.

### Bug fixes

* Ensured `onError` callback is invoked correctly when `disableWatchdog` is true or during watchdog initialization failure. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/284579cad663924e812cf3f931c0ad310ab47445))
* Prevented editor crash when the `disabled` prop changes during initialization. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/284579cad663924e812cf3f931c0ad310ab47445))

### Other changes

* Upgraded the minimal version of Node.js to 20.0.0 due to the end of LTS. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/06ce665af5dc1b158c6d06fdbb0ac664cbad1c86))


## [10.0.0-alpha.0](https://github.com/ckeditor/ckeditor5-react/compare/v9.5.0...v10.0.0-alpha.0) (2025-05-05)

### BREAKING CHANGES

* Upgraded the minimal version of Node.js to 20.0.0 due to the end of LTS.

### Bug fixes

* Ensured `onError` callback is invoked correctly when `disableWatchdog` is true or during watchdog initialization failure. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/284579cad663924e812cf3f931c0ad310ab47445))
* Prevented editor crash when the `disabled` prop changes during initialization. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/284579cad663924e812cf3f931c0ad310ab47445))

### Other changes

* Upgraded the minimal version of Node.js to 20.0.0 due to the end of LTS. ([commit](https://github.com/ckeditor/ckeditor5-react/commit/06ce665af5dc1b158c6d06fdbb0ac664cbad1c86))

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5-react/releases).
