# CKEditor 5 Component for React

[![Join the chat at https://gitter.im/ckeditor/ckeditor5](https://badges.gitter.im/ckeditor/ckeditor5.svg)](https://gitter.im/ckeditor/ckeditor5?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-react.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-react)
[![Build Status](https://travis-ci.org/ckeditor/ckeditor5-react.svg?branch=master)](https://travis-ci.org/ckeditor/ckeditor5-react)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5-react/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5-react?branch=master)
<br>
[![Dependency Status](https://david-dm.org/ckeditor/ckeditor5-react/status.svg)](https://david-dm.org/ckeditor/ckeditor5-react)
[![devDependency Status](https://david-dm.org/ckeditor/ckeditor5-react/dev-status.svg)](https://david-dm.org/ckeditor/ckeditor5-react?type=dev)

Official CKEditor 5 React component.

## Using with ready to use CKEditor 5 builds

There are pre-build versions of CKEditor 5 that you can choose from:

* [CKEditor 5 classic editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic)
* [CKEditor 5 inline editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline)
* [CKEditor 5 balloon editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon)
* [CKEditor 5 decoupled editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document)

Install bindings and one of the builds:

```bash
npm install --save @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic --production
```

Use CKEditor component inside your project:

```jsx
import React, { Component } from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditorBuild from '@ckeditor/ckeditor5-build-classic';

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>CKEditor 5 using build-classic</h2>
				<CKEditor
					editor={ ClassicEditorBuild }
					data="<p>Hello from CKEditor 5!</p>"
					onChange={ data => console.log( data ) }
				/>
			</div>
		);
	}
}

export default App;	
```

## Available properties

* `editor` _required_ - a class that represents the [Editor](https://docs.ckeditor.com/ckeditor5/latest/api/module_core_editor_editor-Editor.html),
* `data` - an initial data for the created editor, see the [`DataApi#setData()`](https://docs.ckeditor.com/ckeditor5/latest/api/module_core_editor_utils_dataapimixin-DataApi.html#function-setData) method,
* `config` - an object that represents the [`EditorConfig`](https://docs.ckeditor.com/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html) interface,
* `onChange` - a function that will be called when the editor's document was changed, see the [`model.Document#change`](https://docs.ckeditor.com/ckeditor5/latest/api/module_engine_model_document-Document.html#event-change) event,
* `onInit` - a function that is calling once immediately when the editor was initialized. It receives the initialized editor as a parameter.

#### `npm run build` from Create React App produces an error:

```bash
Failed to minify the code from this file:
        <project_root>/node_modules/@ckeditor/ckeditor5-utils/src/ckeditorerror.js:26

Failed to minify the code from this file:                                                                                                                                                                                                                                [31/75]
        <project_root>/node_modules/@ckeditor/ckeditor5-build-classic/build/ckeditor.js:5:2077
```

It causes because CKEditor 5 packages and builds are written ES6. We are aware of this issue but at this moment we don't have a working solution.

## Building custom editor together with your React project

This guide is assuming that you are using [Create React App CLI](https://github.com/facebook/create-react-app) as your 
boilerplate. If not please read more about webpack configuration [here](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/quick-start.html#lets-start).

Install React CLI:

```bash
npm install -g create-react-app
```

Create your project using the CLI and go to the project's directory:

```bash
create-react-app ckeditor5-react-example && cd ckeditor5-react-example
```

Ejecting configuration is needed for custom webpack configuration to load inline SVG images. 
More information about ejecting can be found [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject).

```bash
npm run eject
```

We need to modify webpack configuration scripts to load CKEditor 5 SVG icons properly. After ejecting they are located at

```bash
<project_root>/config/webpack.config.dev.js
<project_root>/config/webpack.config.prod.js
```

### Changes that need to be made to both config files (`webpack.config.dev.js` and `webpack.config.prod.js`)

In both files, at the beginning import an object that creates a configuration for PostCSS:

```js
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
```

Then add two new elements to exported object under `module.rules` array. These are SVG and CSS loaders only for CKEditor 5 code:

```js 
{
  test: /ckeditor5-[^/\\]+\/theme\/icons\/[^/\\]+\.svg$/,
  use: [ 'raw-loader' ]
},
{
  test: /ckeditor5-[^/\\]+\/theme\/.+\.css/,
  use: [
    {
      loader: 'style-loader',
      options: {
        singleton: true
      }
    },
    {
      loader: 'postcss-loader',
      options: styles.getPostCssConfig( {
        themeImporter: {
          themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
        },
        minify: true
      } )
    }
  ]
},
```

Exclude CSS files used by CKEditor 5 from project's CSS loader:

```js
{
  test: /\.css$/,
  exclude: /ckeditor5-[^/\\]+\/theme\/.+\.css/,
  // (...)
}
```

and exclude CKEditor 5 SVG and CSS files from `file-loader` because these files will be handled by the loaders added previously 
(usually the last item in `module.rules` array is the `file-loader`) so it looks like this:

```js
{
  loader: require.resolve('file-loader'),
  // Exclude `js` files to keep "css" loader working as it injects
  // it's runtime that would otherwise processed through "file" loader.
  // Also exclude `html` and `json` extensions so they get processed
  // by webpacks internal loaders.
  exclude: [
  	/\.(js|jsx|mjs)$/, 
  	/\.html$/, 
  	/\.json$/, 
  	/ckeditor5-[^/\\]+\/theme\/icons\/[^/\\]+\.svg$/,
  	/ckeditor5-[^/\\]+\/theme\/.+\.css/
  ],
  options: {
    name: 'static/media/[name].[hash:8].[ext]'
  }
}
```

Next, install `raw-loader`, theme for CKEditor 5 and CKEditor 5 dev-utils:

```bash 
npm install raw-loader @ckeditor/ckeditor5-theme-lark @ckeditor/ckeditor5-dev-utils --save-dev 
```

Install bindings, editor and plugins you need:

```bash
npm install --save \ 
	@ckeditor/ckeditor5-react \ 
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-heading \
	@ckeditor/ckeditor5-paragraph
```

or install [ready-to-use CKEditor 5 builds](https://docs.ckeditor.com/ckeditor5/latest/builds/guides/overview.html#available-builds):

```bash
npm install --save @ckeditor/ckeditor5-build-classic
```

### Use CKEditor component together with [CKEditor 5 framework](https://docs.ckeditor.com/ckeditor5/latest/framework/):

```jsx
import React, { Component } from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>CKEditor 5 using custom build</h2>
				<CKEditor
					onInit={ editor => console.log( 'Editor is ready to use!', editor ) }
					onChange={ data => console.log( data ) }
					config={ {
						plugins: [ Essentials, Paragraph, Bold, Italic, Heading ],
						toolbar: [ 'heading', '|', 'bold', 'italic', '|', 'undo', 'redo', ]
					} }
					editor={ ClassicEditor }
					data="<p>Hello from CKEditor 5!</p>"
				/>
			</div>
		);
	}
}

export default App;
```

### Use CKEditor component together with [CKEditor5 builds](https://docs.ckeditor.com/ckeditor5/latest/builds/)

```jsx
import React, { Component } from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>CKEditor 5 using custom build</h2>
				<CKEditor
					onInit={ editor => console.log( 'Editor is ready to use!', editor ) }
					onChange={ data => console.log( data ) }
					editor={ ClassicEditor }
					data="<p>Hello from CKEditor 5!</p>"
				/>
			</div>
		);
	}
}

export default App;
```

#### Document editor

If you use the [`Document editor`](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/ui/document-editor.html), [you need to add the toolbar manually](https://docs.ckeditor.com/ckeditor5/latest/api/module_editor-decoupled_decouplededitor-DecoupledEditor.html#static-function-create):

```jsx
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
// Import plugins that you need...

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>CKEditor 5 using custom build - DecoupledEditor</h2>
				<CKEditor
					onInit={ editor => {
						console.log( 'Editor is ready to use!', editor );

						// Inserts the toolbar before the editable area.
						editor.ui.view.editable.element.parentElement.insertBefore(
							editor.ui.view.toolbar.element,
							editor.ui.view.editable.element
						);
					} }
					onChange={ data => console.log( data ) }
					editor={ DecoupledEditor }
					data="<p>Hello from CKEditor 5 as DecoupledEditor!</p>"
					config={ /* the editor configuration */ }
				/>
		);
	}
}

export default App;
```

