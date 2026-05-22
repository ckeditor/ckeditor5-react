/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { forwardRef, memo } from 'react';
import { normalizeClassList } from './utils/normalizeClassList.js';
import {
	type EditorElementDefinition,
	normalizeEditorElementDefinition
} from './utils/normalizeEditorElementDefinition.js';

/**
 * Creates and renders a dynamic React element based on the element definition owned and provided by the editor.
 *
 * @param props The component properties.
 */
export const EditorElement = memo( forwardRef<HTMLElement, Props>( ( { definition }, ref ) => {
	const { id, name: Tag, classes, styles, attributes } = normalizeEditorElementDefinition( definition ?? {
		name: 'div'
	} );

	return (
		<Tag
			ref={ref}
			{...attributes}
			id={id}
			className={normalizeClassList( classes )}
			style={styles}
		/>
	);
} ) );

EditorElement.displayName = 'EditorElement';

/**
 * Properties for the {@link EditorElement} component.
 */
type Props = {

	/**
     * The definition of the element to be rendered. Defaults to a `div` element if not provided or null.
     */
	definition?: EditorElementDefinition | null;
};
