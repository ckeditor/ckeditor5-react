import React, { useState, useRef, type ChangeEvent } from 'react';
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';
// import { CKMultiRootEditor } from '@ckeditor/ckeditor5-react';
import { CKMultiRootEditor } from '../../src';

const SAMPLE_READ_ONLY_LOCK_ID = 'Integration Sample';

type EditorDemoProps = {
	content: Record<string, string>;
};

export default function EditorDemo( props: EditorDemoProps ): JSX.Element {
	const sectionRefs = useRef<Record<string, HTMLDivElement>>( {} );
	const rootsRef = useRef<Record<string, HTMLDivElement>>( {} );

	const [ editor, setEditor ] = useState<MultiRootEditor | null>( null );
	const [ state, setState ] = useState<Record<string, string>>( props.content );
	const [ selectedRoot, setSelectedRoot ] = useState<string>();
	const [ disabledRoots, setDisabledRoots ] = useState<Array<string>>( [] );

	const updateData = ( changedRoots: Array<string> ) => {
		setState( prevState => {
			const changedData = changedRoots.reduce( ( result, rootName ) => {
				result[ rootName ] = editor!.getData( { rootName } );

				return result;
			}, {} as Record<string, string> );

			return {
				...prevState,
				...changedData
			};
		} );
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

	const addRoot = ( attributes: Record<string, unknown> ) => {
		editor!.addRoot( 'root' + new Date().getTime(), { attributes } );
	};

	const removeRoot = () => {
		editor!.detachRoot( selectedRoot!, true );
	};

	const handleNewRoot = ( root: any ) => {
		const domElement = editor!.createEditable( root ) as HTMLDivElement;
		const section = root.getAttribute( 'section' ) as string;

		rootsRef.current[ root.rootName ] = domElement;
		sectionRefs.current[ section ].appendChild( domElement );
	};

	const handleRemovedRoot = ( root: any ) => {
		editor!.detachEditable( root );

		rootsRef.current[ root.rootName ].remove();
		delete rootsRef.current[ root.rootName ];

		setSelectedRoot( '' );
	};

	const setSourceElement = ( element: HTMLDivElement | null ) => {
		if ( element && element.id ) {
			const rootName = element.id;

			rootsRef.current[ rootName ] = element;
		}
	};

	return (
		<>
			<h2 className="subtitle">Editor Demo</h2>
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
					onClick={ removeRoot }
					disabled={ !selectedRoot }
				>
					Remove root
				</button>

				<select value={ selectedRoot || 'placeholder'} onChange={ ( evt: ChangeEvent<HTMLSelectElement> ) => {
					setSelectedRoot( evt.target.value );
				}}>
					<option hidden value='placeholder'>Select root to remove</option>

					{ Object.keys( rootsRef.current ).map( rootName => (
						<option key={ rootName } value={ rootName }>{ rootName }</option>
					) ) }
				</select>
			</div>

			<br />

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
					<div id="intro" data-ck-root-name="intro" ref={ setSourceElement } />
					<div id="content" ref={ setSourceElement } />
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
					<div id="outro" ref={ setSourceElement } />
				</div>
			</div>

			{ /* @ts-expect-error: Caused by linking to parent project and conflicting react types */ }
			<CKMultiRootEditor
				editor={ MultiRootEditor }
				id="0"
				data={ state }
				sourceElements={ rootsRef.current }
				watchdogConfig={ { crashNumberLimit: 10 } }

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
