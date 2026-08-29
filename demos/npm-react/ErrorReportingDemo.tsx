/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useRef, useState } from 'react';

import { CKEditor } from '../../src/index.js';
import ClassicEditor from './ClassicEditor.js';

type Report = {
	id: string;
	at: string;
	editor: string;
	phase: string;
	message: string;
};

const EDITORS = [ 'First editor', 'Second editor' ];

/**
 * Two editors side by side, each reporting through its own `onError`.
 *
 * The point of the demo is what happens after an error: nothing restarts, so the editor keeps its content
 * and its undo history, and only the editor that failed reports anything.
 */
export default function ErrorReportingDemo( props: { content: string } ): JSX.Element {
	const [ reports, setReports ] = useState<Array<Report>>( [] );
	const instancesRef = useRef<Record<string, any>>( {} );

	const report = ( name: string ) => ( error: Error, { phase }: { phase: string } ) => {
		setReports( current => [
			...current,
			{
				id: `${ Date.now() }-${ current.length }`,
				at: new Date().toLocaleTimeString(),
				editor: name,
				phase,
				message: error.message.split( '\n' )[ 0 ]
			}
		] );
	};

	// Thrown from a timeout so that it escapes as an uncaught error, which is the path a real one takes.
	// The editor is passed as the error context, and that is what ties the error to this editor.
	// Remove it in the actual integration.
	const simulateError = ( name: string ) => {
		const editor = instancesRef.current[ name ];

		setTimeout( () => {
			const err: any = new Error( 'simulated-error' );

			err.context = editor;
			err.is = () => true;

			throw err;
		} );
	};

	return (
		<>
			<p className="info">
				Each editor below reports through its own <code>onError</code>. Click a
				&apos;Simulate an error&apos; button and watch the log: only the editor you clicked reports,
				and <strong>both editors keep working</strong> — type something first and see for yourself.
				Nothing is restarted, so the content and the undo history survive.
			</p>
			<p className="info">
				Under the hood there is one page-wide registration, and the component tells its own errors
				apart by comparing the reported source with its own editor instance. That is the same thing
				you would do if you registered <code>onEditorError()</code> yourself.
			</p>

			<hr /><br />

			{ /* Side by side on purpose: the demo is about seeing that only one of them reports. */ }
			<div style={ { display: 'flex', gap: '16px', alignItems: 'flex-start' } }>
				{ EDITORS.map( name => (
					<div key={ name } style={ { flex: 1, minWidth: 0 } }>
						<h3>{ name }</h3>

						<CKEditor
							editor={ ClassicEditor }
							data={ props.content }
							onError={ report( name ) }
							onReady={ ( editor: any ) => {
								instancesRef.current[ name ] = editor;
							} }
						/>

						<button type="button" onClick={ () => simulateError( name ) }>
							Simulate an error
						</button>
					</div>
				) ) }
			</div>

			<h3>Reported errors</h3>

			<button type="button" onClick={ () => setReports( [] ) }>Clear</button>

			{ reports.length === 0 ?
				<p><em>Nothing reported yet.</em></p> :
				<ol>
					{ reports.map( entry => (
						<li key={ entry.id }>
							{ entry.at } · <strong>{ entry.editor }</strong> · { entry.phase } · { entry.message }
						</li>
					) ) }
				</ol>
			}
		</>
	);
}
