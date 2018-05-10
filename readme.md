# CKEditor 5 bindings for react

## Installation

``` 
npm install --save cke5-react 
```


## Using with ready to use CKEditor 5 builds

There are pre-build versions of CKEditor 5 that you can choose from:
* [CKEditor 5 classic editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic)
* [CKEditor 5 inline editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline)
* [CKEditor 5 balloon editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon)

Install one of the builds:

```
npm install --save @ckeditor/ckeditor5-editor-classic
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
			<div className="app">
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




