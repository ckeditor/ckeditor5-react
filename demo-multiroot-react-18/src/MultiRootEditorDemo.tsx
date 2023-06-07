import React, { useState, useRef, type ChangeEvent } from 'react';
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';
// import { CKEditor } from '@ckeditor/ckeditor5-react';
import { CKEditor } from '../../src';

const SAMPLE_READ_ONLY_LOCK_ID = 'Integration Sample';

enum Sections {
	'section-1' = 'section-1',
	'section-2' = 'section-2'
}

type EditorDemoProps = {
	content: Record<string, string>;
	rootsAttributes: Record<string, Record<string, unknown>>;
};

export default function EditorDemo( props: EditorDemoProps ): JSX.Element {
	const initialRootsRefs: Record<string, HTMLDivElement> = {};

	const sectionRefs = useRef<Record<string, HTMLDivElement>>( {} );
	const [ editor, setEditor ] = useState<MultiRootEditor | null>( null );
	const [ state, setState ] = useState<Record<string, string>>( props.content );
	const [ selectedRoot, setSelectedRoot ] = useState<string>();
	const [ disabledRoots, setDisabledRoots ] = useState<Array<string>>( [] );

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

	const updateData = ( changedRoots: Record<string, { changedData?: boolean; changedAttributes?: boolean }> ) => {
		if ( !Object.keys( changedRoots ).length ) {
			return;
		}

		const newState: Record<string, string> = {};
		let hasNewAttributes = false;

		for ( const [ rootName, { changedData, changedAttributes } ] of Object.entries( changedRoots ) ) {
			if ( changedData ) {
				newState[ rootName ] = editor!.getData( { rootName } );
			}

			if ( changedAttributes && !hasNewAttributes ) {
				hasNewAttributes = true;
			}
		}

		setState( { ...state, ...newState } );

		if ( hasNewAttributes ) {
			setAttributes( { ...editor!.getRootsAttributes() } );
		}
	};

	const toggleReadOnly = () => {
		const root = editor!.model.document.selection.getFirstRange()!.root;

		if ( !root || !root.rootName ) {
			return;
		}

		const index = disabledRoots.indexOf( root.rootName );

		if ( index >= 0 ) {
			disabledRoots.splice( index, 1 );
			setDisabledRoots( [ ...disabledRoots ] );

			editor!.enableRoot( root.rootName, SAMPLE_READ_ONLY_LOCK_ID );
		} else {
			setDisabledRoots( [ ...disabledRoots, root.rootName ] );

			editor!.disableRoot( root.rootName, SAMPLE_READ_ONLY_LOCK_ID );
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

	const getSectionElements = ( section: Sections ) => elements
		.filter( element => attributes[ element.props.id ].section === section )
		.sort( ( a, b ) =>
			( attributes[ a.props.id ].order as number ) - ( attributes[ b.props.id ].order as number ) );

	const addRoot = ( attributes: Record<string, unknown> ) => {
		editor!.addRoot( 'root' + new Date().getTime(), {
			attributes: { ...attributes, order: ( elements.length + 1 ) * 10 }
		} );
	};

	const removeRoot = () => {
		editor!.detachRoot( selectedRoot!, true );
	};

	const swapRoots = ( dir: 1 | -1 ) => {
		const root = editor!.model.document.selection.getFirstRange()!.root;

		if ( !root || !root.rootName ) {
			return;
		}

		const sectionElements = getSectionElements( attributes[ root.rootName ].section as Sections );
		const index = sectionElements.findIndex( el => el.props.id === root.rootName );

		if ( !sectionElements[ index + dir ] ) {
			return;
		}

		const swapRoot = editor!.model.document.getRoot( sectionElements[ index + dir ].props.id )!;

		editor!.model.change( writer => {
			const rootNewOrder = swapRoot.getAttribute( 'order' );
			const swapRootNewOrder = root.getAttribute( 'order' );

			writer.setAttribute( 'order', rootNewOrder, root );
			writer.setAttribute( 'order', swapRootNewOrder, swapRoot );
		} );
	};

	const handleNewRoot = ( createRootElement: ( props?: Record<string, unknown> ) => JSX.Element ) => {
		setElements( [ ...elements, createRootElement() ] );
	};

	const handleRemovedRoot = ( root: any ) => {
		const rootName = root.rootName;

		delete state[ rootName ];
		setState( { ...state } );

		setElements( elements.filter( element => element.props.id !== rootName ) );
		setSelectedRoot( '' );
	};

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

				<button
					onClick={ () => swapRoots( -1 ) }
					disabled={ !editor }
				>
					Move root back
				</button>

				<button
					onClick={ () => swapRoots( 1 ) }
					disabled={ !editor }
				>
					Move root forward
				</button>
			</div>

			<div className="buttons">
				<button
					onClick={ removeRoot }
					disabled={ !selectedRoot }
				>
					Remove root
				</button>

				<select value={ selectedRoot || 'placeholder'} onChange={ ( evt: ChangeEvent<HTMLSelectElement> ) => {
					setSelectedRoot( evt.target.value );
				}}>
					<option hidden value='placeholder'>Select root to remove</option>

					{ Object.keys( state ).map( rootName => (
						<option key={ rootName } value={ rootName }>{ rootName }</option>
					) ) }
				</select>
			</div>

			<br />

			<div ref={ el => {
				if ( editor ) {
					el?.appendChild( editor!.ui.view.toolbar.element! );
				}
			}}></div>

			<div>
				<h2>Section 1</h2>

				<button
					onClick={ () => addRoot( { section: 'section-1' } ) }
				>
					Add root below
				</button>

				<div className="flex" ref={ el => {
					sectionRefs.current![ 'section-1' ] = el!;
				} }>
					{ getSectionElements( Sections[ 'section-1' ] ) }
				</div>
			</div>

			<div>
				<h2>Section 2</h2>

				<button
					onClick={ () => addRoot( { section: 'section-2' } ) }
				>
					Add root below
				</button>

				<div className="wrapper" ref={ el => {
					sectionRefs.current![ 'section-2' ] = el!;
				} }>
					{ getSectionElements( Sections[ 'section-2' ] ) }
				</div>
			</div>

			{ /* @ts-expect-error: Caused by linking to parent project and conflicting react types */ }
			<CKEditor
				editor={ MultiRootEditor }
				id="0"
				data={ state }
				sourceElements={ initialRootsRefs }
				watchdogConfig={ { crashNumberLimit: 10 } }
				config={ {
					rootsAttributes: props.rootsAttributes
				} as any }

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
