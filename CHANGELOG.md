Changelog
=========

## [11.2.0](https://github.com/ckeditor/ckeditor5-react/compare/v11.1.2...v11.2.0) (June 8, 2026)

### Features

* The `useMultiRootEditor` hook now returns `addRoot` and `removeRoot` helpers directly. Previously, adding or removing a root required manually manipulating the `data` and `attributes` state outside the hook. You can now call them directly:

  ```js
  const { addRoot, removeRoot } = useMultiRootEditor( props );

  await addRoot({
    name: 'my-root',
    data: '<p>Hello</p>',
    attributes: { order: 10 },
    editableOptions: {
      element: 'section',
      placeholder: 'Start typing...',
      label: 'My section'
    }
  });

  await removeRoot( 'my-root' );
  ```
* The `<CKEditor>` component now supports paragraph-like editor configurations. When `config.root.element` (or `config.roots.main.element`) is provided, you can customize the tag name, CSS classes and inline styles of the editable element instead of relying on the default plain `<div>`.
* Each editable root in the multi-root editor can now be configured independently with its own HTML element type, placeholder text and accessible label. Pass an `editableOptions` object to `addRoot` to control the `element` (e.g. `'section'`, `'article'`), `placeholder` and assistive-technology `label` for that specific root.

### Other changes

* Readme simplification.


## [11.1.2](https://github.com/ckeditor/ckeditor5-react/compare/v11.1.1...v11.1.2) (April 15, 2026)

### Bug fixes

* Fixed an issue where the editor's alpha version was being compared incorrectly.


## [11.1.1](https://github.com/ckeditor/ckeditor5-react/compare/v11.1.0...v11.1.1) (April 13, 2026)

### Other changes

* Improved compatibility with the latest CKEditor 48.x. Closes [#658](https://github.com/ckeditor/ckeditor5-react/issues/658).


## [11.1.0](https://github.com/ckeditor/ckeditor5-react/compare/v11.1.0-alpha.1...v11.1.0) (March 24, 2026)

### Features

* Added support for CKEditor 5 `48.0.0` and the new `roots` editor configuration. Closes [#653](https://github.com/ckeditor/ckeditor5-react/issues/653).

### Bug fixes

* Fixed incorrect nightly version detection. Closes [#659](https://github.com/ckeditor/ckeditor5-react/issues/659).


## [11.1.0-alpha.1](https://github.com/ckeditor/ckeditor5-react/compare/v11.1.0-alpha.0...v11.1.0-alpha.1) (March 19, 2026)

### Bug fixes

* Fixed incorrect nightly version detection. Closes [#659](https://github.com/ckeditor/ckeditor5-react/issues/659).

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5-react/releases).
