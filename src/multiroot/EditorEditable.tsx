/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { forwardRef, useEffect, useRef, memo, type ElementType, useMemo } from 'react';

import { mergeRefs } from '../utils/mergeRefs.js';
import type { MultiRootEditor } from 'ckeditor5';

/**
 * A React component that renders a single editable area (root) for the `MultiRootEditor`.
 */
export const EditorEditable = memo( forwardRef<HTMLDivElement, Props>( ( { id, editor, rootName }, ref ) => {
	const innerRef = useRef<HTMLDivElement>( null );

	const root = useMemo( () => editor?.model.document.getRoot( rootName ), [ editor, rootName ] );
	const rootEditableOptions = useMemo( () => {
		if ( !root ) {
			return null;
		}

		const options = root.getAttribute( '$rootEditableOptions' ) as RootEditableOptionsAttribute | undefined;

		return options ?? {};
	}, [ root ] );

	useEffect( () => {
		if ( !editor || !root || !rootEditableOptions ) {
			return;
		}

		// Detach already attached editable if any.
		if ( editor.ui.getEditableElement( rootName ) ) {
			editor.detachEditable( root );
		}

		const editableElement = innerRef.current!;
		const editable = editor.ui.view.createEditable( rootName, editableElement );

		editor.ui.addEditable( editable );
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

	const { name: TagName } = rootEditableOptions.element ?? { name: 'div' };

	return (
		<TagName
			key={editor?.id}
			id={id}
			ref={ mergeRefs( ref, innerRef ) }
		/>
	);
} ) );

EditorEditable.displayName = 'EditorEditable';

type Props = {
	id: string;
	rootName: string;
	editor: MultiRootEditor | null;
};

type RootEditableOptionsAttribute = {

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
	element?: ViewRootElementDefinition;
};

type ViewRootElementDefinition = {

	/**
	 * The DOM tag name to use.
	 */
	name: ElementType;

	/**
	 * Class name or array of class names to apply to the editable element. Each name can be provided as a string.
	 */
	classes?: string | Array<string>;

	/**
	 * Inline styles to apply to the editable element as a record of style properties.
	 */
	styles?: Record<string, string>;

	/**
	 * Additional DOM attributes to apply to the editable element.
	 */
	attributes?: Record<string, string>;
};
