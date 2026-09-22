Changelog
=========

## [12.0.0-alpha.0](https://github.com/ckeditor/ckeditor5-react/compare/v11.2.0...v12.0.0-alpha.0) (September 22, 2026)

### BREAKING CHANGES

* The Watchdog is gone, and with it the automatic restart of a crashed editor. An editor that crashes now stays as it is, with its content and its undo history, instead of being rebuilt from the data it had before. Errors are reported through `onError` as before, and the `<CKEditorContext>` component now creates and shares a `Context` directly.

  **CKEditor 5 in version 49 or higher is now required.** That is where the error reporting this integration uses appears. The declared peer dependency and the runtime version check were raised to match.

  Compile-breaking for anyone using `<CKEditorContext>`:

  * The `contextWatchdog` prop is gone. It used to be required, so every `<CKEditorContext contextWatchdog={ ... }>` has to drop it.
  * The `context` prop is now required. It used to be optional, because the watchdog could supply the class instead.
  * `onReady` receives only the context. Its second argument, the `ContextWatchdog`, no longer exists. The second argument of `onChangeInitializedEditors` is now a `Context` for the same reason.

  Everywhere else:

  * The `disableWatchdog` and `watchdogConfig` props were removed from `<CKEditor>` and `useMultiRootEditor()`, and `watchdogConfig` from `<CKEditorContext>`. There is no watchdog left to disable or configure.
  * The `CKEditor#watchdog` getter was removed.
  * The `onError` details object no longer carries `willEditorRestart` or `willContextRestart`. Nothing restarts, so there is nothing to announce. It still carries `phase`, which is `'initialization'` or `'runtime'` as before.
  * `ContextWatchdogContext` was renamed to `CKEditorContextValueContext`, `useCKEditorWatchdogContext()` to `useCKEditorContextValue()`, and the `ContextWatchdogValue` type to `CKEditorContextValue`. The value they carry is a `Context` rather than a `ContextWatchdog`: the `watchdog` member of the initialized value is now `context`.
  * `CKEditorContextValue`'s `error` member is typed as `Error`, which is what it has always held.

  Integrators who relied on the restart should handle `onError` themselves — reload the editor, tell the user, or report to their error tracker.

### Features

* The stylesheets loaded by `useCKEditorCloud()` can now be injected into a shadow root instead of `document.head`, so the editor styles stay scoped to a web component rather than leaking into the page. Pass the root as `targetNode` of the `injectedStylesheetsLocation` option.


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

---

To see all releases, visit the [release page](https://github.com/ckeditor/ckeditor5-react/releases).
