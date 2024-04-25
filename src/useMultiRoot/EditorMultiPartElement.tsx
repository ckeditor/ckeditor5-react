/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useEffect, useRef, type ReactElement, type MutableRefObject } from 'react';

import type { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import type { Editor } from '@ckeditor/ckeditor5-core';
import type { LifeCycleEditorSemaphore } from '../lifecycle/LifeCycleEditorSemaphore';

export const EditorMultiPartElement = <TEditor extends MultiRootEditor, TEditorPart>( {
	semaphore,
	onMount,
	onUnmount
}: EditorPartElementProps<TEditor, TEditorPart> ): ReactElement => {
	const ref = useRef<HTMLDivElement>( null );

	useEffect( () => {
		if ( !semaphore ) {
			return;
		}

		const partRef: MutableRefObject<TEditorPart | null> = { current: null };

		semaphore.runAfterMount( ( { instance } ) => {
			partRef.current = onMount( instance, ref.current );
		} );

		return () => {
			if ( semaphore.value && partRef.current ) {
				onUnmount( semaphore.value.instance, partRef.current );
			}
		};
	}, [ semaphore ] );

	return <div ref={ref} />;
};

export type EditorPartElementProps<TEditor extends Editor, TEditorPart> = {
	semaphore: LifeCycleEditorSemaphore<TEditor> | null;
	onMount: ( editor: TEditor, node: HTMLDivElement | null ) => TEditorPart;
	onUnmount: ( editor: TEditor, part: TEditorPart ) => void;
};
