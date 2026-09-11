/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useRef, useState } from 'react';

import { CKEditor } from '../../src/index.js';
import ClassicEditor from '../npm-react/ClassicEditor.js';
import ErrorLog, { simulateErrorFrom, toReport, type Report } from './ErrorLog.js';

/**
 * The basics: one editor, one `onError`, and what the editor does after an error — which is carry on.
 */
export default function SingleEditorDemo( props: { content: string } ): JSX.Element {
	const [ reports, setReports ] = useState<Array<Report>>( [] );
	const editorRef = useRef<any>( null );

	return (
		<>
			<p className="info">
				Type something, then simulate an error. The editor keeps the text and the undo history,
				because nothing restarts it. What you get instead is a call to <code>onError</code>, and it
				is up to you what to do with it.
			</p>
			<p className="info">
				<code>phase</code> tells you whether the editor failed to start at all, or broke while it was
				running. That is the only detail the callback carries besides the error itself.
			</p>

			<hr /><br />

			<div className="buttons">
				<button type="button" onClick={ () => simulateErrorFrom( editorRef.current ) }>
					Simulate an error
				</button>
			</div>

			<CKEditor
				editor={ ClassicEditor }
				data={ props.content }
				onReady={ ( editor: any ) => {
					editorRef.current = editor;
				} }
				onError={ ( error, { phase } ) => {
					setReports( current => [ ...current, toReport( 'the editor', error, phase, current.length ) ] );
				} }
			/>

			<ErrorLog reports={ reports } onClear={ () => setReports( [] ) } />
		</>
	);
}
