import React, { useState, type ChangeEvent } from 'react';
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';

import { useMultiRootEditor, type MultiRootHookProps } from '../../src';

const SAMPLE_READ_ONLY_LOCK_ID = 'Integration Sample';

type EditorDemoProps = {
	data: Record<string, string>;
	rootsAttributes: Record<string, Record<string, unknown>>;
};

export default function MultiRootEditorRichDemo( props: EditorDemoProps ): JSX.Element {
	const editorProps: MultiRootHookProps = {
		editor: MultiRootEditor,
		data: props.data,
		rootsAttributes: props.rootsAttributes,

		onReady: editor => {
			window.editor = editor;

			console.log( 'event: onChange', { editor } );
		},
		onChange: ( event, editor ) => {
			console.log( 'event: onChange', { event, editor } );
		},
		onBlur: ( event, editor ) => {
			console.log( 'event: onBlur', { event, editor } );
		},
		onFocus: ( event, editor ) => {
			console.log( 'event: onFocus', { event, editor } );
		},

		config: {
			rootsAttributes: props.rootsAttributes
		}
	};

	const {
		editor, editableElements, toolbarElement,
		data, setData,
		attributes, setAttributes
	} = useMultiRootEditor( editorProps );

	// The <select> element state, used to pick the root to remove.
	// This is for demo purposes, and you may remove it in the actual integration or change accordingly to your needs.
	const [ selectedRoot, setSelectedRoot ] = useState<string>();

	// The <input> element state with number of roots that should be added in one row.
	// This is for demo purposes, and you may remove it in the actual integration or change accordingly to your needs.
	const [ numberOfRoots, setNumberOfRoots ] = useState<number>( 1 );

	// A set with disabled roots. It is used to support read-only feature in multi root editor.
	// This is for demo purposes, and you may remove it in the actual integration or change accordingly to your needs.
	const [ disabledRoots, setDisabledRoots ] = useState<Set<string>>( new Set() );

	// Function to toggle read-only mode for selected root.
	const toggleReadOnly = () => {
		const root = editor!.model.document.selection.getFirstRange()!.root;

		if ( !root || !root.rootName ) {
			return;
		}

		const isReadOnly = disabledRoots.has( root.rootName );

		if ( isReadOnly ) {
			disabledRoots.delete( root.rootName );
			editor!.enableRoot( root.rootName, SAMPLE_READ_ONLY_LOCK_ID );
		} else {
			disabledRoots.add( root.rootName );
			editor!.disableRoot( root.rootName, SAMPLE_READ_ONLY_LOCK_ID );
		}

		setDisabledRoots( new Set( disabledRoots ) );
	};

	// Function to simulate an error in the editor.
	// It is used for testing purposes to trigger the Watchdog to restart the editor.
	// Remove it in the actual integration.
	const simulateError = () => {
		setTimeout( () => {
			const err: any = new Error( 'foo' );

			err.context = editor;
			err.is = () => true;

			throw err;
		} );
	};

	const addRoot = ( newRootAttributes: Record<string, unknown>, rootId?: string ) => {
		const id = rootId || new Date().getTime();

		for ( let i = 1; i <= numberOfRoots; i++ ) {
			const rootName = `root-${ i }-${ id }`;

			data[ rootName ] = '';

			// Remove code related to rows if you don't need to handle multiple roots in one row.
			attributes[ rootName ] = { ...newRootAttributes, order: i * 10, row: id };
		}

		setData( { ...data } );
		setAttributes( { ...attributes } );
		// Reset the <input> element to the default value.
		setNumberOfRoots( 1 );
	};

	const removeRoot = ( rootName: string ) => {
		setData( previousData => {
			const { [ rootName! ]: _, ...newData } = previousData;

			return { ...newData };
		} );

		setSelectedRoot( '' );
	};

	// Group elements based on their row attribute and sort them by order attribute.
	// Grouping in a row is used for presentation purposes, and you may remove it in actual integration.
	// However, we recommend ordering the roots, so that rows are put in a correct places when undo/redo is used.
	const groupedElements = Object.entries(
		editableElements
			.sort( ( a, b ) => ( attributes[ a.props.id ].order as number ) - ( attributes[ b.props.id ].order as number ) )
			.reduce( ( acc: Record<string, Array<JSX.Element>>, element ) => {
				const row = attributes[ element.props.id ].row as string;
				acc[ row ] = acc[ row ] || [];
				acc[ row ].push( element );

				return acc;
			}, {} )
	);

	return (
		<>
			<h2 className="subtitle">Multi-root Editor Demo (rich integration)</h2>
			<p className="info">This sample demonstrates a more advanced integration of the multi-root editor in React.</p>
			<p className="info">
				Multiple extra features are implemented to illustrate how you can customize your application and use the provided API.<br />
				They are optional, and you do not need to include them in your application.<br />
				However, they can be a good starting point for your own custom features.
			</p>
			<p className="info">
				The &apos;Simulate an error&apos; button makes the editor throw an error to show you how it is restarted by
				the <code>Watchdog</code> mechanism.<br />
				Note, that <code>Watchdog</code> is enabled by default.<br />
				It can be disabled by passing the `disableWatchdog` flag to the `useMultiRootEditor` hook.
			</p>
			<p className="info">Component&apos;s events are logged to the console.</p>
			<hr /><br />

			<div className="buttons">
				<button
					onClick={ toggleReadOnly }
					disabled={ !editor || !Object.keys( data ).length }
				>
					Toggle read-only mode
				</button>

				<button
					onClick={ simulateError }
					disabled={ !editor }
				>
					Simulate an error
				</button>
			</div>

			<div className="buttons">
				<button
					onClick={ () => removeRoot( selectedRoot! ) }
					disabled={ !selectedRoot }
				>
					Remove root
				</button>

				<select value={ selectedRoot || 'placeholder'} onChange={ ( evt: ChangeEvent<HTMLSelectElement> ) => {
					setSelectedRoot( evt.target.value );
				}}>
					<option hidden value="placeholder">Select root to remove</option>

					{ Object.keys( data ).map( rootName => (
						<option key={ rootName } value={ rootName }>{ rootName }</option>
					) ) }
				</select>
			</div>

			<div className="buttons">
				<button
					onClick={ () => addRoot( { row: 'section-1' } ) }
				>
					Add row with roots
				</button>

				<input
					type="number"
					min="1"
					max="4"
					value={ numberOfRoots }
					onChange={e => Number( e.target.value ) <= 4 && setNumberOfRoots( Number( e.target.value ) )}
				/>
			</div>

			<br />

			{ toolbarElement }

			{ /* Maps through `groupedElements` array to render rows that contains the editor roots. */ }
			{ groupedElements.map( ( [ row, elements ] ) => (
				<div key={row} className={`flex wrapper-row-${ row }`}>
					{ elements }
				</div>
			) ) }
		</>
	);
}
