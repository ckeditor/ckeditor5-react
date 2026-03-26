/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorConstructor } from '../types/EditorConstructor.js';

/**
 * Assigns a DOM element to the editor configuration in a way that is compatible with the specific editor type.
 *
 * @param Editor Constructor of the editor used to determine the location of element config entry.
 * @param element Element to be assigned to config.
 * @param config Config of the editor.
 * @returns The updated configuration object.
 */
export function assignElementToEditorConfig( Editor: EditorConstructor, element: HTMLElement, config: RelaxedConfig ): RelaxedConfig {
	if ( !Editor.editorName || Editor.editorName === 'ClassicEditor' ) {
		return {
			...config,
			attachTo: element
		};
	}

	const mappedConfig: RelaxedConfig = {
		...config,
		roots: {
			...config.roots,
			main: {
				...config.root,
				...config.roots?.main,
				element
			}
		}
	};

	delete mappedConfig.root;

	return mappedConfig;
}

type RelaxedConfig = Record<string, any>;
