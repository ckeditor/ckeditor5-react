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

	const [ editor, setEditor ] = useState<MultiRootEditor | null>( null );
	const [ content, setContent ] = useState<Record<string, string>>( props.content );
	const [ selectedRoot, setSelectedRoot ] = useState<string>();
	const [ numberOfRoots, setNumberOfRoots ] = useState<number>( 1 );
	const [ disabledRoots, setDisabledRoots ] = useState<Set<string>>( new Set() );
	const toolbarRef = useRef<HTMLDivElement>( null );

	const setInitialSourceElement = ( element: HTMLDivElement | null ) => {
		if ( element && element.id ) {
			const rootName = element.id;

			initialRootsRefs[ rootName ] = element;
		}
	};

	const [ elements, setElements ] = useState<Array<JSX.Element>>(
		Object.keys( props.content ).map( rootName => <div id={rootName} key={rootName} ref={ setInitialSourceElement }></div> )
	);
	const [ attributes, setAttributes ] = useState<Record<string, Record<string, unknown>>>( props.rootsAttributes );

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

	const handleNewRoot = ( createRootElement: ( props?: Record<string, unknown> ) => JSX.Element ) => {
		const element = createRootElement();

		setElements( previousElements => [ ...previousElements, element ] );
	};

	const handleRemovedRoot = ( { rootName }: { rootName: string } ) => {
		// Handling of undo operations.
		if ( content[ rootName ] !== undefined ) {
			removeRoot( rootName );
		}

		setElements( previousElements => previousElements.filter( element => element.props.id !== rootName ) );
	};

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
