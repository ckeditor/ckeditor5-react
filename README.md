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

This package's release process is automated via CircleCI. Before you start a new release, you'll need to prepare the changelog entries.

1. Make sure the `#master` branch is up-to-date: `git fetch && git checkout master && git pull`.
1. Prepare a release branch: `git checkout -b release-[YYYY-MM-DD]` where `YYYY-MM-DD` is the current day.
1. Generate the changelog entries: `yarn run changelog --branch release-[YYYY-MM-DD]`.
    * This task checks what changed in each package and bumps the version accordingly. If nothing changes at all, it won't create a new changelog entry. If changes were irrelevant (e.g., only dependencies), it would make an "internal changes" entry.
    * Scan the logs printed by the tool to search for errors (incorrect changelog entries). Incorrect entries (e.g., ones without the type) should be addressed. You may need to create entries for them manually. This is done directly in CHANGELOG.md (in the root directory). Make sure to verify the proposed version after you modify the changelog.
1. Commit all changes and prepare a new pull request targeting the `#master` branch.
1. Ping the @ckeditor/ckeditor-5-devops team to review the pull request and trigger the release process.

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the LICENSE.md file.
