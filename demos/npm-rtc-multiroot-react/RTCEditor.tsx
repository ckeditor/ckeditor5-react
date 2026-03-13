/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import React, { useMemo, useRef } from 'react';
import { useMultiRootEditor } from '../../src/index.js';
import {
	MultiRootEditor,
	Autoformat,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	BlockQuote,
	Essentials,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	Indent,
	IndentBlock,
	Link,
	List,
	ListProperties,
	Paragraph,
	PasteFromOffice,
	Table,
	TableToolbar,
	TableColumnResize,
	TextTransformation,
	CloudServices
} from 'ckeditor5';

import {
	RealTimeCollaborativeEditing,
	RealTimeCollaborativeComments,
	RealTimeCollaborativeTrackChanges,
	PresenceList,
	Comments,
	TrackChanges,
	TrackChangesData
} from 'ckeditor5-premium-features';

import { useIsMounted } from '../shared/hooks/useIsMounted.js';
import { useCollaborationChannelId } from '../shared/hooks/useCollaborationChannelId.js';
import { useCollaborationCredentials } from '../shared/hooks/useCollaborationCredentials.js';

const INITIAL_DATA = {
	intro: '<h2>Introduction</h2><p>Start collaborating in real time.</p>',
	content: '<h3>Main content</h3><p>Add more roots with the button below.</p>'
};

interface RTCEditorProps {
	initialData?: Record<string, string>;
}

export function RTCEditor( { initialData = INITIAL_DATA }: RTCEditorProps ): JSX.Element {
	const initialRootsAttributes = useMemo( () => Object.fromEntries( Object.keys( initialData ).map( name => [ name, {} ] ) ), [] );

	const presenceListRef = useRef<HTMLDivElement>( null );
	const sidebarRef = useRef<HTMLDivElement>( null );

	const channelId = useCollaborationChannelId();
	const credentials = useCollaborationCredentials();
	const isLayoutReady = useIsMounted();

	const { editor, toolbarElement, editableElements, data, setData, setAttributes } = useMultiRootEditor( {
		isLayoutReady,

		editor: MultiRootEditor,
		data: initialData,
		rootsAttributes: initialRootsAttributes,
		disableTwoWayDataBinding: true,

		config: {
			licenseKey: credentials.licenseKey,

			plugins: [
				Autoformat, BlockQuote, Bold, Essentials, Heading,
				Image, ImageCaption, ImageStyle, ImageToolbar,
				Indent, IndentBlock, Italic, Link, List, ListProperties,
				Paragraph, PasteFromOffice, Strikethrough,
				Table, TableColumnResize, TableToolbar,
				TextTransformation, Underline,

				Comments, PresenceList,
				RealTimeCollaborativeComments,
				RealTimeCollaborativeEditing,
				RealTimeCollaborativeTrackChanges,
				TrackChanges, TrackChangesData,
				CloudServices
			],

			toolbar: {
				items: [
					'undo', 'redo',
					'|', 'heading',
					'|', 'bold', 'italic', 'underline', 'strikethrough',
					'|', 'link', 'insertTable', 'blockQuote',
					'|', 'bulletedList', 'numberedList',
					'|', 'outdent', 'indent',
					'|', 'comment', 'trackChanges'
				],
				shouldNotGroupWhenFull: true
			},

			cloudServices: {
				tokenUrl: credentials.tokenUrl,
				uploadUrl: credentials.cloudServiceUploadUrl,
				webSocketUrl: credentials.websocketUrl
			},

			collaboration: { channelId },

			presenceList: { container: presenceListRef.current },
			sidebar: { container: sidebarRef.current },

			image: {
				toolbar: [
					'imageStyle:inline', 'imageStyle:block', 'imageStyle:side',
					'|', 'toggleImageCaption', 'imageTextAlternative'
				]
			},

			table: {
				contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableColumnResize' ]
			}
		},

		onError: ( error, { willEditorRestart } ) => {
			if ( willEditorRestart ) {
				console.warn( '[RTCEditor] Crashed – watchdog will restart.', error );
			} else {
				console.error( '[RTCEditor] Fatal error.', error );
			}
		}
	} );

	const handleAddRoot = () => {
		const name = `section-${ crypto.randomUUID() }`;

		setData( prev => ( { ...prev, [ name ]: '<h3>New section</h3><p>Start typing…</p>' } ) );
		setAttributes( prev => ( { ...prev, [ name ]: {} } ) );
	};

	const handleRemoveRoot = ( name: string ) => {
		setData( prev => {
			const next = { ...prev };
			delete next[ name ];
			return next;
		} );

		setAttributes( prev => {
			const next = { ...prev };
			delete next[ name ];
			return next;
		} );
	};

	const roots = Object.keys( data )
		.map( ( name, i ) => ( { name, element: ( editableElements as Array<React.ReactElement> )[ i ] } ) )
		.filter( ( { element } ) => !!element );

	return (
		<div className="rtc-editor">
			<div ref={ presenceListRef } className="rtc-editor__presence" />
			<div className="rtc-editor__toolbar">
				{ toolbarElement }
			</div>
			<div className="rtc-editor__roots">
				{ roots.map( ( { name, element } ) => (
					<div key={ name } className="rtc-editor__root-block">
						<div className="rtc-editor__root-header">
							<span className="rtc-editor__root-name">{ name }</span>
							<button
								className="rtc-btn rtc-btn--remove"
								onClick={ () => handleRemoveRoot( name ) }
							>
								✕ Remove
							</button>
						</div>
						{ element }
					</div>
				) ) }
			</div>
			<div className="rtc-editor__footer">
				<button
					className="rtc-btn rtc-btn--add"
					onClick={ handleAddRoot }
					disabled={ !editor }
				>
					＋ Add root
				</button>
			</div>
			<div ref={ sidebarRef } className="rtc-editor__sidebar" />
		</div>
	);
}
