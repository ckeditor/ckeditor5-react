/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { forwardRef, memo, type ElementType } from 'react';
import { normalizeClassList } from './utils/normalizeClassList.js';

/**
 * Creates and renders a dynamic React element based on the element definition owned and provided by the editor.
 *
 * @param props The component properties.
 */
export const EditorElement = memo( forwardRef<HTMLElement, EditorElementProps>( ( { definition }, ref ) => {
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
 * Normalizes an editor element definition into a structured object.
 *
 * @param definition The definition to normalize.
 * @returns A strictly typed object definition containing at least the element name.
 */
export function normalizeEditorElementDefinition( definition: EditorElementDefinition ): EditorElementObjectDefinition {
	if ( typeof HTMLElement !== 'undefined' && definition instanceof HTMLElement ) {
		throw new Error(
			'An HTMLElement cannot be used as an editor element definition. ' +
			'Please pass a string, a React component, or an object definition.'
		);
	}

	if ( typeof definition !== 'object' || definition === null ) {
		return {
			name: definition
		};
	}

	return definition as EditorElementObjectDefinition;
}

/**
 * Defines an editor element. It can be a basic React element type or a detailed configuration object.
 */
export type EditorElementDefinition = ElementType | EditorElementObjectDefinition;

/**
 * An object-based definition for an editor element, allowing customization
 * of classes, styles, and HTML attributes.
 */
export type EditorElementObjectDefinition = {

	/**
     * The DOM tag name or React component to use.
     */
	name: ElementType;

	/**
     * The unique identifier (ID) to apply to the editable element.
     */
	id?: string;

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

/**
 * Properties for the {@link EditorElement} component.
 */
export type EditorElementProps = {

	/**
     * The definition of the element to be rendered. Defaults to a `div` element if not provided or null.
     */
	definition?: EditorElementDefinition | null;
};
