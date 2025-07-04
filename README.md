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

### Running the development server

To manually test the editor integration with different versions of React, you can start the development server using one of the commands below:

```bash
npm run dev:16 # Open the demo projects using React 16.
npm run dev:18 # Open the demo projects using React 18.
npm run dev:19 # Open the demo projects using React 19.
```

### Executing tests

To test the editor integration against a set of automated tests, run the following command:

```bash
npm run test
```

If you want to run the tests in watch mode, use the following command:

```bash
npm run test:watch
```

### Building the package

To build the package that is ready to publish, use the following command:

```bash
npm run build
```

## Releasing package

CircleCI automates the release process and can release both channels: stable (`X.Y.Z`) and pre-releases (`X.Y.Z-alpha.X`, etc.).

Before you start, you need to prepare the changelog entries.

1. Make sure the `#master` branch is up-to-date: `git fetch && git checkout master && git pull`.
1. Prepare a release branch: `git checkout -b release-[YYYYMMDD]` where `YYYYMMDD` is the current day.
1. Generate the changelog entries: `yarn run release:prepare-changelog`.
	* You can specify the release date by passing the `--date` option, e.g., `--date=2025-06-11`.
	* By passing the `--dry-run` option, you can check what the script will do without actually modifying the files.
	* Read all the entries, correct poor wording and other issues, wrap code names in backticks to format them, etc.
	* Add the missing `the/a` articles, `()` to method names, "it's" -> "its", etc.
	* A newly introduced feature should have just one changelog entry – something like "The initial implementation of the FOO feature." with a description of what it does.
1. Commit all changes and prepare a new pull request targeting the `#master` branch.
1. Ping the `@ckeditor/ckeditor-5-platform` team to review the pull request and trigger the release process.

## License

Licensed under a dual-license model, this software is available under:

* the [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html),
* or commercial license terms from CKSource Holding sp. z o.o.

For more information, see: [https://ckeditor.com/legal/ckeditor-licensing-options](https://ckeditor.com/legal/ckeditor-licensing-options).
