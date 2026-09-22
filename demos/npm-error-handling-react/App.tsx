/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useState } from 'react';

import SingleEditorDemo from './SingleEditorDemo.js';
import TwoEditorsDemo from './TwoEditorsDemo.js';
import ContextEditorsDemo from './ContextEditorsDemo.js';

type Demo = 'single' | 'two' | 'context';

const editorContent = `
	<h2>Sample</h2>
	<p>Type something here, then simulate an error and see that it is still here afterwards.</p>
`;

export default function App(): JSX.Element {
	const [ demo, setDemo ] = useState<Demo>( 'single' );

	return (
		<React.StrictMode>
			<h1>CKEditor 5 – React Component – error handling</h1>

			<p className="info">
				There is no Watchdog any more, so a crashed editor stays as it is instead of being silently
				rebuilt. These demos show what you get in its place.
			</p>

			<div className="buttons" style={ { textAlign: 'center' } }>
				<button onClick={ () => setDemo( 'single' ) } disabled={ demo == 'single' }>
					One editor
				</button>

				<button onClick={ () => setDemo( 'two' ) } disabled={ demo == 'two' }>
					Two editors
				</button>

				<button onClick={ () => setDemo( 'context' ) } disabled={ demo == 'context' }>
					Editors in a context
				</button>
			</div>

			{ demo == 'single' && <SingleEditorDemo content={ editorContent }/> }
			{ demo == 'two' && <TwoEditorsDemo content={ editorContent }/> }
			{ demo == 'context' && <ContextEditorsDemo content={ editorContent }/> }
		</React.StrictMode>
	);
}
