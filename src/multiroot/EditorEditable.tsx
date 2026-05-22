/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { forwardRef, useEffect, useRef, memo, useMemo } from 'react';

import { mergeRefs } from '../utils/mergeRefs.js';
import type { MultiRootEditor } from 'ckeditor5';
import {
	EditorElement,
	normalizeEditorElementDefinition,
	type EditorElementDefinition
} from '../EditorElement.js';

export const ROOT_EDITABLE_OPTIONS_ATTRIBUTE = '$rootEditableOptions';

/**
 * A React component that renders a single editable area (root) for the `MultiRootEditor`.
 */
export const EditorEditable = memo( forwardRef<HTMLElement, Props>( ( { id, editor, rootName }, ref ) => {
	const innerRef = useRef<HTMLElement>( null );

	const root = useMemo( () => editor?.model.document.getRoot( rootName ), [ editor, rootName ] );
	const rootEditableOptions = useMemo( () => {
		if ( !root ) {
			return null;
		}

		const options = root.getAttribute( ROOT_EDITABLE_OPTIONS_ATTRIBUTE ) as RootEditableOptionsAttribute | undefined;

		return { ...options };
	}, [ root ] );

	useEffect( () => {
		if ( !editor || !root || !rootEditableOptions ) {
			return;
		}

		// Detach already attached editable if any.
		if ( editor.ui.getEditableElement( rootName ) ) {
			editor.detachEditable( root );
		}

		const editable = editor.ui.view.createEditable( rootName, innerRef.current!, rootEditableOptions.label );

		editor.ui.addEditable( editable, rootEditableOptions.placeholder );
		editor.editing.view.forceRender();

		return () => {
			/* istanbul ignore next -- @preserve: It depends on the version of the React and may not happen all of the times. */
			if ( editor && editor.state !== 'destroyed' ) {
				const currentRoot = editor.model.document.getRoot( rootName );

				/* istanbul ignore else -- @preserve */
				if ( currentRoot === root ) {
					editor.detachEditable( root );
				}
			}
		};
	}, [ editor, root, rootEditableOptions ] );

	if ( !rootEditableOptions ) {
		return null;
	}

	return (
		<EditorElement
			key={editor?.id}
			ref={ mergeRefs( ref, innerRef ) }
			definition={{
				...normalizeEditorElementDefinition( rootEditableOptions?.element ?? {
					name: 'div'
				} ),
				id
			}}
		/>
	);
} ) );

EditorEditable.displayName = 'EditorEditable';

type Props = {
	id: string;
	rootName: string;
	editor: MultiRootEditor | null;
};

export type RootEditableOptionsAttribute = {

	/**
	 * Placeholder for the editable element. If not set, placeholder value from the editor configuration will be used (if it was provided).
	 */
	placeholder?: string;

	/**
	 * The accessible label text describing the editable to the assistive technologies.
	 */
	label?: string;

	/**
	 * A description of the editable root element to create.
	 */
	element?: EditorElementDefinition;
};
