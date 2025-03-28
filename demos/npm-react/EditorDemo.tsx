/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useState } from 'react';
import ClassicEditor from './ClassicEditor.js';
import { CKEditor } from '../../src/index.js';

declare global {
	interface Window {
		editor: ClassicEditor | null;
	}
}

const SAMPLE_READ_ONLY_LOCK_ID = 'Integration Sample';

type EditorDemoProps = {
	content: string;
};

type EditorDemoState = {
	documents: Array<string>;
	documentID: number;
	editor: ClassicEditor | null;
};

export default function EditorDemo( props: EditorDemoProps ): JSX.Element {
	const [ isWatchdogDisabled, setIsWatchdogDisabled ] = useState( false );
	const [ state, setState ] = useState<EditorDemoState>( {
		documents: [ props.content ],
		documentID: 0,
		editor: null
	} );

	const updateData = () => {
		setState( prevState => ( {
			...prevState,
			documents: state.documents.map( ( data, index ) => {
				if ( index === state.documentID ) {
					return state.editor!.getData();
				}

				return data;
			} )
		} ) );
	};

	const toggleReadOnly = () => {
		const editor = state.editor!;

		if ( editor.isReadOnly ) {
			editor.disableReadOnlyMode( SAMPLE_READ_ONLY_LOCK_ID );
		} else {
			editor.enableReadOnlyMode( SAMPLE_READ_ONLY_LOCK_ID );
		}
	};

	const simulateError = () => {
		setTimeout( () => {
			const err: any = new Error( 'foo' );

			err.context = state.editor;
			err.is = () => true;

			throw err;
		} );
	};

	const nextDocumentID = () => {
		setState( prevState => ( {
			...prevState,
			documentID: state.documentID + 1,
			documents: state.documents.length < state.documentID + 1 ?
				state.documents :
				[ ...state.documents, props.content ]
		} ) );
	};

	const previousDocumentID = () => {
		setState( prevState => ( { ...prevState, documentID: Math.max( state.documentID - 1, 0 ) } ) );
	};

	return (
		<>
			<h2 className="subtitle">Editor Demo</h2>
			<p className="info">Component&apos;s events are logged to the console.</p>

			<div className="buttons">
				<button
					onClick={ () => toggleReadOnly() }
					disabled={ !state.editor }
				>
					Toggle read-only mode
				</button>

				<button
					onClick={ () => simulateError() }
					disabled={ !state.editor }
				>
					Simulate an error
				</button>

				<button
					onClick={ () => previousDocumentID() }
					disabled={ !state.editor || state.documentID == 0 }
				>
					Previous document ID
				</button>

				<button
					onClick={ () => nextDocumentID() }
				>
					Next document ID
				</button>
				<button
					onClick={ () => setIsWatchdogDisabled( !isWatchdogDisabled ) }
				>
					{ isWatchdogDisabled ? 'Enable' : 'Disable' } watchdog
				</button>
			</div>

			<CKEditor
				editor={ ClassicEditor as any }
				id={ state.documentID }
				disableWatchdog={ isWatchdogDisabled }
				data={ state.documents[ state.documentID ] }
				watchdogConfig={ { crashNumberLimit: 10 } }

				onReady={ ( editor: any ) => {
					window.editor = editor;

					console.log( 'event: onReady' );

					setState( prevState => ( { ...prevState, editor } ) );
				} }

				onChange={ ( event, editor ) => {
					updateData();

					console.log( 'event: onChange', { event, editor } );
				} }

				onBlur={ ( event, editor ) => {
					console.log( 'event: onBlur', { event, editor } );
				} }

				onFocus={ ( event, editor ) => {
					console.log( 'event: onFocus', { event, editor } );
				} }
			/>
		</>
	);
}
