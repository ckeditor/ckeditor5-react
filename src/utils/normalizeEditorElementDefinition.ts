/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { ElementType } from 'react';

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
