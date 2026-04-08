/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { forwardRef, useEffect, useRef } from 'react';
import { mergeRefs } from '../utils/mergeRefs.js';

/**
 * A React component that wraps and renders the CKEditor toolbar.
 * It extracts the toolbar DOM element from the provided editor instance
 * and safely appends it to a local `div` container, handling cleanup on unmount.
 */
export const EditorToolbarWrapper = forwardRef( ( { editor }: any, ref ) => {
	const toolbarRef = useRef<HTMLDivElement>( null );

	useEffect( () => {
		const toolbarContainer = toolbarRef.current;

		if ( !editor || !toolbarContainer ) {
			return undefined;
		}

		const element = editor.ui.view.toolbar.element!;

		toolbarContainer.appendChild( element! );

		return () => {
			if ( toolbarContainer.contains( element ) ) {
				toolbarContainer.removeChild( element! );
			}
		};
	}, [ editor && editor.id ] );

	return <div ref={mergeRefs( toolbarRef, ref )}></div>;
} );

EditorToolbarWrapper.displayName = 'EditorToolbarWrapper';
