/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { forwardRef, useEffect, useRef, memo } from 'react';

import { mergeRefs } from '../utils/mergeRefs.js';

import type { LifeCycleSemaphoreSyncRefResult } from '../lifecycle/useLifeCycleSemaphoreSyncRef.js';
import type { EditorSemaphoreMountResult } from '../lifecycle/LifeCycleEditorSemaphore.js';
import type { InlineEditableUIView, MultiRootEditor } from 'ckeditor5';

export const EditorEditable = memo( forwardRef<HTMLDivElement, Props>( ( { id, semaphore, rootName }, ref ) => {
	const innerRef = useRef<HTMLDivElement>( null );

	useEffect( () => {
		let editable: InlineEditableUIView | null;
		let editor: MultiRootEditor | null;

		semaphore.runAfterMount( ( { instance } ) => {
			if ( !innerRef.current ) {
				return;
			}

			editor = instance;

			const { ui, model } = editor;
			const root = model.document.getRoot( rootName );

			if ( root && editor.ui.getEditableElement( rootName ) ) {
				editor.detachEditable( root );
			}

			editable = ui.view.createEditable( rootName, innerRef.current );
			ui.addEditable( editable );

			instance.editing.view.forceRender();
		} );

		return () => {
			/* istanbul ignore next -- @preserve: It depends on the version of the React and may not happen all of the times. */
			if ( editor && editor.state !== 'destroyed' && innerRef.current ) {
				const root = editor.model.document.getRoot( rootName );

				/* istanbul ignore else -- @preserve */
				if ( root ) {
					editor.detachEditable( root );
				}
			}
		};
	}, [ semaphore.revision ] );

	return (
		<div
			key={semaphore.revision}
			id={id}
			ref={ mergeRefs( ref, innerRef ) }
		/>
	);
} ) );

EditorEditable.displayName = 'EditorEditable';

type Props = {
	id: string;
	rootName: string;
	semaphore: LifeCycleSemaphoreSyncRefResult<EditorSemaphoreMountResult<MultiRootEditor>>;
};
