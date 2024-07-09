# CKEditor 5 rich text editor component for React

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-react.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-react)
[![CircleCI](https://circleci.com/gh/ckeditor/ckeditor5-react.svg?style=shield)](https://app.circleci.com/pipelines/github/ckeditor/ckeditor5-react?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5-react/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5-react?branch=master)
![Dependency Status](https://img.shields.io/librariesio/release/npm/@ckeditor/ckeditor5-react)

Official [CKEditor 5](https://ckeditor.com/ckeditor-5/) rich text editor component for React.

## [Developer Documentation](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/react.html) 📖

See the ["Rich text editor component for React"](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/react/react.html) guide in the [CKEditor 5 documentation](https://ckeditor.com/docs/ckeditor5/latest) to learn more:

* [Quick start](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/react/react.html#quick-start)
* [Using CKEditr 5 Builder](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/react/react.html#using-ckeditor-5-builder)
* [Installling from npm](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/react/react.html#installing-from-npm)
* [Component properties](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/react/react.html#component-properties)

## Contributing

After cloning this repository, install necessary dependencies:

```bash
npm install
```

You can also use [Yarn](https://yarnpkg.com/).

### Executing tests

Before starting tests execution, you need to build the package. You can use `npm run build` in order to build the production-ready version
or `npm run develop` which produces a development version with attached watcher for all sources files.

```bash
npm run test -- [additional options]
# or
npm t -- [additional options]
```

The command accepts the following options:

* `--coverage` (`-c`) &ndash; Whether to generate the code coverage.
* `--source-map` (`-s`) &ndash; Whether to attach the source maps.
* `--watch` (`-w`) &ndash; Whether to watch test files.
* `--reporter` (`-r`) &ndash; Reporter for Karma (default: `mocha`, can be changed to `dots`).
* `--browsers` (`-b`) &ndash; Browsers that will be used to run tests (default: `Chrome`, available: `Firefox`).

### Building the package

Build a minified version of the package that is ready to publish:

```bash
npm run build
```

## Releasing package

### Changelog

Before starting the release process, you need to generate the changelog:

```bash
npm run changelog
```


