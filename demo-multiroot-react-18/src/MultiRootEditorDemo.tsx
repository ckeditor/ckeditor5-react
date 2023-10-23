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

	// State variables for managing the current editor instance, its content and attributes.
	const [ editor, setEditor ] = useState<MultiRootEditor | null>( null );
	const [ content, setContent ] = useState<Record<string, string>>( props.content );
	const [ attributes, setAttributes ] = useState<Record<string, Record<string, unknown>>>( props.rootsAttributes );

	// The select element state to pick the root for removing.
	const [ selectedRoot, setSelectedRoot ] = useState<string>();

	// The number of roots that should be added in one row. It is used to present the adding new editor roots feature.
	const [ numberOfRoots, setNumberOfRoots ] = useState<number>( 1 );

	// The Set of disabled roots. It is used to support read-only feature in multi root editor.
	const [ disabledRoots, setDisabledRoots ] = useState<Set<string>>( new Set() );

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

	// This hook is essential when integrating with Watchdog.
	// It ensures reinitializing the toolbar element and updating the state.
	// After restarting, the new editor instance might have different state, saved with a delay.
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
		let hasNewAttributes = false;

		for ( const [ rootName, { changedData, changedAttributes } ] of Object.entries( changedRoots ) ) {
			if ( changedData ) {
				newContent[ rootName ] = editor!.getData( { rootName } );
			}

			if ( changedAttributes && !hasNewAttributes ) {
				hasNewAttributes = true;
			}
		}

		setContent( { ...content, ...newContent } );

		if ( hasNewAttributes ) {
			setAttributes( { ...editor!.getRootsAttributes() } );
		}
	};

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
	// It is used to trigger watchdog to restart the editor.
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
			attributes[ rootName ] = { ...newRootAttributes, order: i * 10, row: id };
		}

		setContent( { ...content } );
		setAttributes( { ...attributes } );
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
	// This callback is necessary to correctly handle the multi root editor state.
	const handleNewRoot = ( createRootElement: ( props?: Record<string, unknown> ) => JSX.Element ) => {
		const element = createRootElement();

		setElements( previousElements => [ ...previousElements, element ] );
	};

	// Function to handle the removal of a root element from the editor.
	// This callback is necessary to correctly handle the multi root editor state.
	const handleRemovedRoot = ( { rootName }: { rootName: string } ) => {
		// Handling of undo operations.
		if ( content[ rootName ] !== undefined ) {
			removeRoot( rootName );
		}

		setElements( previousElements => previousElements.filter( element => element.props.id !== rootName ) );
	};

	// Grouping elements based on their row attribute and sorting them by order attribute.
	// It is used only for presentation purposes.
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

			<div ref={ toolbarRef }></div>

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
