/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useRef, useState } from 'react';

import { CKEditor } from '../../src/index.js';
import ClassicEditor from '../npm-react/ClassicEditor.js';
import ErrorLog, { simulateErrorFrom, toReport, type Report } from './ErrorLog.js';

const EDITORS = [ 'First editor', 'Second editor' ];

/**
 * Two independent editors. The thing to see is that an error reaches only the one it came from, and that
 * the other one is not disturbed at all.
 */
export default function TwoEditorsDemo( props: { content: string } ): JSX.Element {
	const [ reports, setReports ] = useState<Array<Report>>( [] );
	const instancesRef = useRef<Record<string, any>>( {} );

	return (
		<>
			<p className="info">
				Type into both editors, then simulate an error in one of them. Only that one reports, and
				neither of them loses anything.
			</p>
			<p className="info">
				Registration is page-wide rather than per editor, so the component tells its own errors apart
				by comparing the reported source with its own instance. That is the same line you would write
				if you registered <code>onEditorError()</code> yourself.
			</p>

			<hr /><br />

			<div style={ { display: 'flex', gap: '16px', alignItems: 'flex-start' } }>
				{ EDITORS.map( name => (
					<div key={ name } style={ { flex: 1, minWidth: 0 } }>
						<h3>{ name }</h3>

						<div className="buttons">
							<button type="button" onClick={ () => simulateErrorFrom( instancesRef.current[ name ] ) }>
								Simulate an error
							</button>
						</div>

						<CKEditor
							editor={ ClassicEditor }
							data={ props.content }
							onReady={ ( editor: any ) => {
								instancesRef.current[ name ] = editor;
							} }
							onError={ ( error, { phase } ) => {
								setReports( current => [ ...current, toReport( name, error, phase, current.length ) ] );
							} }
						/>
					</div>
				) ) }
			</div>

			<ErrorLog reports={ reports } onClear={ () => setReports( [] ) } />
		</>
	);
}
