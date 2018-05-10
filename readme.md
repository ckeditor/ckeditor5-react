# CKEditor 5 bindings for React

## Using with ready to use CKEditor 5 builds

There are pre-build versions of CKEditor 5 that you can choose from:
* [CKEditor 5 classic editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic)
* [CKEditor 5 inline editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline)
* [CKEditor 5 balloon editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon)

Install bindings and one of the builds:

```
npm install --save cke5-react @ckeditor/ckeditor5-editor-classic
```

Use CKEditor component inside your project:
```js
import React, { Component } from 'react';
import './App.css';
import CKEditor from 'cke5-react';
import ClassicEditorBuild from '@ckeditor/ckeditor5-build-classic';


class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>CKEditor 5 using build-classic</h2>
				<CKEditor
					editor={ ClassicEditorBuild }
					data="<p>Hello from CKEditor 5</p>"
					onChange={ data => console.log( data ) }
				/>
			</div>
		);
	}
}

export default App;	
```

## Building custom editor together with your React project

This guide is assuming that you are using [Create React App CLI](https://github.com/facebook/create-react-app) as your 
boilerplate. If not please read more about webpack configuration [here](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/quick-start.html#lets-start).

Install React CLI:
``` 
npm install -g create-react-app
```

Create your project using the CLI and go to the project's directory:
```
create-react-app ckeditor5-react-example && cd ckeditor5-react-example
```

Ejecting configuration is needed for custom webpack configuration to load inline SVG images. 
More information about ejecting can be found [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject).

```
npm run eject
```

We need to modify webpack configuration scripts to load CKEditor 5 svg icons properly. After ejecting they are located at
```
<project_root>/config/webpack.config.dev.js
<project_root>/config/webpack.config.prod.js
```

In both files we need to add new element to exported object under `module.rules` array:
```js 
{
  test: /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/,
  use: [ 'raw-loader' ]
}
```

and exclude CKEditor 5 svg files from `file-loader` (usually the last item in `module.rules` array) so it looks like this:

```js
{
  loader: require.resolve('file-loader'),
  // Exclude `js` files to keep "css" loader working as it injects
  // it's runtime that would otherwise processed through "file" loader.
  // Also exclude `html` and `json` extensions so they get processed
  // by webpacks internal loaders.
  exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/, /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/],
  options: {
    name: 'static/media/[name].[hash:8].[ext]',
  }
}
```

Next, install `raw-loader`:
``` 
npm install --save-dev raw-loader
```

Install bindings, editor and plugins you need:

``` 
npm install --save \ 
	cke5-react \ 
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials/src/essentials \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-heading
```

Use CKEditor component inside your project:

```js
import React, { Component } from 'react';
import './App.css';
import CKEditor from 'cke5-react';

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
					onChange={ data => console.log( data ) }
					config={ {
						plugins: [ Essentials, Paragraph, Bold, Italic, Heading ],
						toolbar: [ 'heading', '|', 'bold', 'italic', '|', 'undo', 'redo', ]
					} }
					editor={ ClassicEditor }
					data="<p>Hello from CKEditor 5</p>"
				/>
			</div>
		);
	}
}

export default App;
```
