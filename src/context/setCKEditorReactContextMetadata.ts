/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Config, EditorConfig } from 'ckeditor5';

/**
 * The symbol cannot be used as a key because config getters require strings as keys.
 */
const ReactContextMetadataKey = '$__CKEditorReactContextMetadata';

/**
 * Sets the metadata in the object.
 *
 * @param metadata The metadata to set.
 * @param object The object to set the metadata in.
 * @returns The object with the metadata set.
 */
export function withCKEditorReactContextMetadata(
	metadata: CKEditorConfigContextMetadata,
	config: EditorConfig
): EditorConfig & { [ ReactContextMetadataKey ]: CKEditorConfigContextMetadata } {
	return {
		...config,
		[ ReactContextMetadataKey ]: metadata
	};
}

/**
 * Tries to extract the metadata from the object.
 *
 * @param object The object to extract the metadata from.
 */
export function tryExtractCKEditorReactContextMetadata( object: Config<any> ): CKEditorConfigContextMetadata | null {
	return object.get( ReactContextMetadataKey );
}

/**
 * The metadata that is stored in the React context.
 */
export type CKEditorConfigContextMetadata = {

	/**
	 * The name of the editor in the React context. It'll be later used in the `useInitializedCKEditorsMap` hook
	 * to track the editor initialization and destruction events.
	 */
	name?: string;

	/**
	 * Any additional metadata that can be stored in the context.
	 */
	[x: string | number | symbol]: unknown;
};
