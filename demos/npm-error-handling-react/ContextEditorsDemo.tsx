/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useState } from 'react';

import type { Context, Editor } from 'ckeditor5';

import { CKEditor, CKEditorContext } from '../../src/index.js';
import ClassicEditor from '../npm-react/ClassicEditor.js';
import ErrorLog, { simulateErrorFrom, toReport, type Report } from './ErrorLog.js';

/**
 * Two editors sharing a context. Sharing a context does not make them share their errors, and the context
 * has an `onError` of its own for what belongs to it rather than to either editor.
 */
export default function ContextEditorsDemo( props: { content: string } ): JSX.Element {
	const [ reports, setReports ] = useState<Array<Report>>( [] );
	const [ editors, setEditors ] = useState<Record<string, { instance: Editor }>>( {} );
	const [ context, setContext ] = useState<Context | null>( null );

	const record = ( from: string ) => ( error: Error, { phase }: { phase: string } ) => {
		setReports( current => [ ...current, toReport( from, error, phase, current.length ) ] );
	};

	return (
		<>
			<p className="info">
				Both editors below run in one shared context. An error still belongs to the editor it came
				from — simulate one in each and watch the log name them separately.
			</p>
			<p className="info">
				The context has its own <code>onError</code>. It hears about what belongs to the context
				rather than to any single editor, which is what an error from a context plugin looks like.
			</p>

			<hr /><br />

			<CKEditorContext
				context={ ClassicEditor.Context as any }
				onError={ record( 'the context' ) }
				onReady={ instance => setContext( instance ) }
				onChangeInitializedEditors={ initialized => setEditors( initialized as any ) }
			>
				<div className="buttons">
					<button
						type="button"
						disabled={ !context }
						onClick={ () => simulateErrorFrom( context ) }
					>
						Simulate an error in the context
					</button>
				</div>

				{ [ 'editor1', 'editor2' ].map( name => (
					<div key={ name }>
						<div className="buttons">
							<button
								type="button"
								disabled={ !editors[ name ] }
								onClick={ () => simulateErrorFrom( editors[ name ]!.instance ) }
							>
								Simulate an error in { name }
							</button>
						</div>

						<CKEditor
							contextItemMetadata={ { name } }
							editor={ ClassicEditor as any }
							data={ props.content }
							onError={ record( name ) }
						/>
					</div>
				) ) }
			</CKEditorContext>

			<ErrorLog reports={ reports } onClear={ () => setReports( [] ) } />
		</>
	);
}
