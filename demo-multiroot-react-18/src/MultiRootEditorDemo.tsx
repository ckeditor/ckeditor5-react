import React, { useState, type ChangeEvent, useEffect, useRef } from 'react';
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';
import { CKEditor } from '@ckeditor/ckeditor5-react';

const SAMPLE_READ_ONLY_LOCK_ID = 'Integration Sample';

type EditorDemoProps = {
	content: Record<string, string>;
	rootsAttributes: Record<string, Record<string, unknown>>;
};

export default function EditorDemo( props: EditorDemoProps ): JSX.Element {
	const initialRootsRefs: Record<string, HTMLDivElement> = {};

	// Current editor instance. It may change if the editor is re-initialized by the Watchdog after an error.
	const [ editor, setEditor ] = useState<MultiRootEditor | null>( null );

	// Current editor content. An object where each key is a root name and the value is the root content.
	const [ content, setContent ] = useState<Record<string, string>>( props.content );

	// Current roots attributes. An object where each key is a root name and the value is an object with root attributes.
	const [ attributes, setAttributes ] = useState<Record<string, Record<string, unknown>>>( props.rootsAttributes );

	// The <select> element state, used to pick the root to remove.
	// This is for demo purposes, and you may remove it in the actual integration or change accordingly to your needs.
	const [ selectedRoot, setSelectedRoot ] = useState<string>();

	// The <input> element state with number of roots that should be added in one row.
	// This is for demo purposes, and you may remove it in the actual integration or change accordingly to your needs.
	const [ numberOfRoots, setNumberOfRoots ] = useState<number>( 1 );

	// The reference for the toolbar element.
	const toolbarRef = useRef<HTMLDivElement>( null );

	const setInitialSourceElement = ( element: HTMLDivElement | null ) => {
		if ( element && element.id ) {
			const rootName = element.id;

			initialRootsRefs[ rootName ] = element;
		}
	};

	// Contains the JSX elements for each editor root.
	const [ elements, setElements ] = useState<Array<JSX.Element>>(
		Object.keys( props.content ).map( rootName => <div id={rootName} key={rootName} ref={ setInitialSourceElement }></div> )
	);

	// This hook is essential for Watchdog integration.
	//
	// When the editor throws an error, the Watchdog will try to re-initialize the editor, so
	// the user is able to continue working.
	//
	// In this handler, we ensure that the old toolbar element (from the crashed editor) is properly removed.
	//
	// We also reset the integration state, so it matches the state of the restarted editor. The editor content is cached
	// by the Watchdog in an interval, and the cached content is used to re-initialize the editor. Because of that,
	// the editor content after re-initialization may be different from the integration state. It is essential to keep them in sync.
	useEffect( () => {
		const container = toolbarRef.current!;

		if ( container && editor ) {
			container.appendChild( editor.ui.view.toolbar.element! );

			// Update the content after reinitializing the editor, for instance after crashing.
			setContent( editor.getFullData() );
			setElements( [ ...elements ].filter( element => Object.keys( editor.getFullData() ).includes( element.props.id ) ) );
		}

		return () => {
			if ( container.firstChild ) {
				container.removeChild( container.firstChild! );
			}
		};
	}, [ editor ] );

	// Function to update content and attributes when root data or attributes change.
	// This callback is invoked whenever data or attributes change in the editor.
	// It enables two-way communication for the 'content' state.
	const updateData = ( changedRoots: Record<string, { changedData?: boolean; changedAttributes?: boolean }> ) => {
		if ( !Object.keys( changedRoots ).length ) {
			return;
		}

		const newContent: Record<string, string> = {};
		const newAttributes: Record<string, Record<string, unknown>> = {};

		for ( const [ rootName, { changedData, changedAttributes } ] of Object.entries( changedRoots ) ) {
			if ( changedData ) {
				newContent[ rootName ] = editor!.getData( { rootName } );
			}

			if ( changedAttributes ) {
				newAttributes[ rootName ] = editor!.getRootAttributes( rootName );
			}
		}

		setContent( { ...content, ...newContent } );
		setAttributes( { ...attributes, ...newAttributes } );
	};

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

			content[ rootName ] = '';

			// Remove code related to rows if you don't need to handle multiple roots in one row.
			attributes[ rootName ] = { ...newRootAttributes, order: i * 10, row: id };
		}

		setContent( { ...content } );
		setAttributes( { ...attributes } );
		// Reset the input to the default value.
		setNumberOfRoots( 1 );
	};

	const removeRoot = ( rootName: string ) => {
		setContent( previousContent => {
			const { [ rootName! ]: _, ...newContent } = previousContent;

			return { ...newContent };
		} );

		setSelectedRoot( '' );
	};

	// Function to handle the addition of a new root element to the editor.
	//
	// After adding an editor root, the React state (elements, content and attributes) should be updated
	// to ensure that the displayed data is up to date.
	//
	// This function is called when a root is created directly (using the editor API),
	// through undo or redo, and during real-time collaboration by a remote user.
	const handleNewRoot = ( createRootElement: ( props?: Record<string, unknown> ) => JSX.Element ) => {
		const element = createRootElement();

		setElements( previousElements => [ ...previousElements, element ] );
	};

	// Function to handle the removal of a root element from the editor.
	//
	// After removing an editor root, the React state (elements, content and attributes) should be updated
	// to ensure that the displayed data is up to date.
	//
	// This function is called when a root is removed directly (using the editor API),
	// through undo or redo, and during real-time collaboration by a remote user.
	const handleRemovedRoot = ( { rootName }: { rootName: string } ) => {
		// Handling of undo operations.
		if ( content[ rootName ] !== undefined ) {
			removeRoot( rootName );
		}

		setElements( previousElements => previousElements.filter( element => element.props.id !== rootName ) );
	};

	// Group elements based on their row attribute and sort them by order attribute.
	// Grouping in a row is used for presentation purposes, and you may remove it in actual integration.
	// However, we recommend ordering the roots, so that rows are put in a correct places when undo/redo is used.
	const groupedElements = Object.entries(
		elements
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
			<h2 className="subtitle">Multi-root Editor Demo</h2>
			<p className="info">Component&apos;s events are logged to the console.</p>

			<div className="buttons">
				<button
					onClick={ toggleReadOnly }
					disabled={ !editor }
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

					{ Object.keys( content ).map( rootName => (
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

				<input type="number" min="1" max="4" value={ numberOfRoots } onChange={e => setNumberOfRoots( Number( e.target.value ) )} />
			</div>

			<br />

			{ /*
				The toolbar element will be rendered inside the following <div> element.
				It is important to use the `ref` feature to easily handle the toolbar element
				after restarting the editor.
			*/ }
			<div ref={ toolbarRef }></div>

			{ /* Maps through groupedElements array to render rows that contains the editor roots. */ }
			{ groupedElements.map( ( [ row, elements ] ) => (
				<div key={row} className={`flex wrapper-row-${ row }`}>
					{ elements }
				</div>
			) ) }

			{ /* @ts-expect-error: Caused by linking to parent project and conflicting react types */ }
			<CKEditor
				editor={ MultiRootEditor }
				id="0"
				data={ content }
				attributes={ attributes }
				sourceElements={ initialRootsRefs }
				watchdogConfig={ { crashNumberLimit: 10 } }
				config={ {
					rootsAttributes: props.rootsAttributes
				} }

				onReady={ editor => {
					window.editor = editor;

					console.log( 'event: onReady' );
					console.log( 'Editor is ready to use! You can use "editor" variable to play with it.' );

					setEditor( editor );
				} }

				onChange={ ( event, editor, changedRoots ) => {
					updateData( changedRoots );

					console.log( 'event: onChange', { event, editor } );
				} }

				onBlur={ ( event, editor ) => {
					console.log( 'event: onBlur', { event, editor } );
				} }

				onFocus={ ( event, editor ) => {
					console.log( 'event: onFocus', { event, editor } );
				} }

				onAddRoot={ handleNewRoot }
				onRemoveRoot={ handleRemovedRoot }
			/>
		</>
	);
}
