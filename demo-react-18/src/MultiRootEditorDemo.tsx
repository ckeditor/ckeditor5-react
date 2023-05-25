import React, { useState, useRef, type ChangeEvent } from 'react';
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';
// import { CKMultiRootEditor } from '@ckeditor/ckeditor5-react';
import { CKMultiRootEditor } from '@ckeditor/ckeditor5-react';

const SAMPLE_READ_ONLY_LOCK_ID = 'Integration Sample';

type EditorDemoProps = {
	content: Record<string, string>;
};

type EditorDemoState = {
	documents: Array<Record<string, string>>;
	documentID: number;
	editor: MultiRootEditor | null;
};

export default function EditorDemo( props: EditorDemoProps ): JSX.Element {
	const editorsRef = useRef<HTMLDivElement>( null );
	const rootsRef = useRef<Record<string, HTMLDivElement>>( {} );

	const [ state, setState ] = useState<EditorDemoState>( {
		documents: [ props.content ],
		documentID: 0,
		editor: null
	} );

	const [ selectedRoot, setSelectedRoot ] = useState<string>();

	const updateData = ( changedRoots: Array<string> ) => {
		setState( prevState => ( {
			...prevState,
			documents: state.documents.map( ( data, index ) => {
				if ( index === state.documentID ) {
					const changedData = changedRoots.reduce( ( result, rootName ) => {
						result[ rootName ] = state.editor!.getData( { rootName } );

						return result;
					}, {} as Record<string, string> );

					return {
						...data,
						...changedData
					};
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
		// setState( prevState => ( {
		// 	...prevState,
		// 	documentID: state.documentID + 1,
		// 	documents: state.documents.length < state.documentID + 1 ?
		// 		state.documents :
		// 		[ ...state.documents, props.content ]
		// } ) );
	};

	const previousDocumentID = () => {
		setState( prevState => ( { ...prevState, documentID: Math.max( state.documentID - 1, 0 ) } ) );
	};

	const addRootBelow = () => {
		state.editor!.addRoot( 'root' + new Date().getTime() );
	};

	const removeRoot = () => {
		state.editor!.detachRoot( selectedRoot!, true );
	};

	const handleNewRoot = ( root: any ) => {
		const domElement = state.editor!.createEditable( root ) as HTMLDivElement;

		rootsRef.current[ root.rootName ] = domElement;
		editorsRef.current!.appendChild( domElement );
	};

	const handleRemovedRoot = ( root: any ) => {
		state.editor!.detachEditable( root );

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
					onClick={ () => addRootBelow() }
				>
					Add root below
				</button>
			</div>

			<div className="buttons">
				<button
					onClick={removeRoot}
					disabled={!selectedRoot}
				>
					Remove selected root
				</button>

				<select value={selectedRoot || 'placeholder'} onChange={ ( evt: ChangeEvent<HTMLSelectElement> ) => {
					setSelectedRoot( evt.target.value );
				}}>
					<option hidden value='placeholder'>Select root to remove</option>

					{ Object.keys( rootsRef.current ).map( rootName => (
						<option key={ rootName } value={ rootName }>{ rootName }</option>
					) ) }
				</select>
			</div>

			{ /* @ts-expect-error: Caused by linking to parent project and conflicting react types */ }
			<CKMultiRootEditor
				editor={ MultiRootEditor }
				id={ state.documentID }
				data={ state.documents[ state.documentID ] }
				sourceElements={ rootsRef.current }
				watchdogConfig={ { crashNumberLimit: 10 } }

				onReady={ editor => {
					window.editor = editor;

					console.log( 'event: onReady' );
					console.log( 'Editor is ready to use! You can use "editor" variable to play with it.' );

					setState( prevState => ( { ...prevState, editor } ) );
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
			>
				<div className="flex">
					<div id="intro" ref={ setSourceElement } />
					<div id="content" ref={ setSourceElement } />
				</div>
			</CKMultiRootEditor>

			<p>Some content from the page.</p>

			<div className="wrapper">
				<div id="outro" ref={ setSourceElement } />
			</div>

			<div id="editors" ref={editorsRef}></div>
		</>
	);
}
