/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React from 'react';

import { useMultiRootEditor, type MultiRootHookProps, CKEditorContext, withCKEditorCloud } from '../../src/index.js';
import { useCKCdnMultiRootEditor } from './useCKCdnMultiRootEditor.js';

const ContextEditorDemo = ( { editor }: { editor: any } ): JSX.Element => {
	const editorProps: Partial<MultiRootHookProps> = {
		editor,

		onChange: ( event, editor ) => {
			console.log( 'event: onChange', { event, editor } );
		},
		onBlur: ( event, editor ) => {
			console.log( 'event: onBlur', { event, editor } );
		},
		onFocus: ( event, editor ) => {
			console.log( 'event: onFocus', { event, editor } );
		}
	};

	// First editor initialization.
	const {
		editor: editor1, editableElements: editableElements1, toolbarElement: toolbarElement1
	} = useMultiRootEditor( {
		...editorProps,
		data: {
			intro: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
			content: '<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>'
		},

		onReady: editor => {
			window.editor1 = editor;

			console.log( 'event: onChange', { editor } );
		}
	} as MultiRootHookProps );

	// Second editor initialization.
	const {
		editor: editor2, editableElements: editableElements2, toolbarElement: toolbarElement2
	} = useMultiRootEditor( {
		...editorProps,
		data: {
			notes: '<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>'
		},

		onReady: editor => {
			window.editor2 = editor;

			console.log( 'event: onChange', { editor } );
		}
	} as MultiRootHookProps );

	// Function to simulate an error in the editor.
	// It is used for testing purposes to trigger the Watchdog to restart the editor.
	// Remove it in the actual integration.
	const simulateError = ( editor: any ) => {
		setTimeout( () => {
			const err: any = new Error( 'foo' );

			err.context = editor;
			err.is = () => true;

			throw err;
		} );
	};

	return (
		<>
			<h2 className="subtitle">Context Multi-root Editor Demo</h2>
			<p className="info">
				This sample demonstrates integration with CKEditorContext.<br />
			</p>
			<p className="info">Component&apos;s events are logged to the console.</p>
			<hr /><br />

			<div>
				<div className="buttons">
					<button
						onClick={ () => simulateError( editor1! ) }
						disabled={ !editor1 }
					>
						Simulate an error in first editor
					</button>
				</div>

				{ toolbarElement1 }

				<div className="flex">
					{ editableElements1 }
				</div>
			</div>

			<br />

			<div>
				<div className="buttons">
					<button
						onClick={ () => simulateError( editor2! ) }
						disabled={ !editor2 }
					>
						Simulate an error in second editor
					</button>
				</div>

				{ toolbarElement2 }

				<div className="flex">
					{ editableElements2 }
				</div>
			</div>
		</>
	);
};

const withCKCloud = withCKEditorCloud( {
	cloud: {
		version: '43.0.0',
		translations: [ 'es', 'de' ],
		premium: true
	}
} );

const ContextMultiRootEditorDemo = withCKCloud( ( { cloud } ): JSX.Element => {
	const MultiRootEditor = useCKCdnMultiRootEditor( cloud );

	return (
		<CKEditorContext
			context={ MultiRootEditor.Context as any }
			contextWatchdog={ MultiRootEditor.ContextWatchdog as any }
		>
			<ContextEditorDemo editor={MultiRootEditor} />
		</CKEditorContext>
	);
} );

export default ContextMultiRootEditorDemo;
