/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import type MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';

import { useEffect, useRef, type RefObject } from 'react';

import type { LifeCycleEditorElementSemaphore } from './LifeCycleEditorElementSemaphore';
import type { EditorWatchdogAdapter } from '../ckeditor';
import type { EditorWatchdog } from '@ckeditor/ckeditor5-watchdog';

export const useEditorLifecycle = <TEditor extends MultiRootEditor>(): EditorLifecycleHookResult<TEditor> => {
	type MountResult = EditorSemaphoreMountResult<TEditor>;

	const semaphoreRef = useRef<LifeCycleEditorElementSemaphore<MountResult>>( null );
	const createSemaphoreAttributeRef = <K extends keyof MountResult>( key: K ): RefObject<MountResult[ K ]> => ( {
		get current() {
			if ( !semaphoreRef.current || !semaphoreRef.current.value ) {
				return null;
			}

			return semaphoreRef.current.value[ key ];
		}
	} );

	const watchdogRef = createSemaphoreAttributeRef( 'watchdog' );
	const editorRef = createSemaphoreAttributeRef( 'instance' );

	useEffect( () => {
		if ( semaphoreRef.current ) {
			semaphoreRef.current.release();
		}
	} );

	return {
		refs: {
			editor: editorRef,
			watchdog: watchdogRef
		}
	};
};

type EditorLifecycleHookResult<TEditor extends Editor> = {
	refs: {
		editor: RefObject<TEditor>;
		watchdog: RefObject<EditorWatchdog<TEditor> | EditorWatchdogAdapter<TEditor> | null>;
	};
};

export type EditorSemaphoreMountResult<TEditor extends Editor> = {

	/**
	 * Holds the instance of the editor if `props.disableWatchdog` is set to true.
	 */
	instance: TEditor;

	/**
	 * An instance of EditorWatchdog or an instance of EditorWatchdog-like adapter for ContextWatchdog.
	 * It holds the instance of the editor under `this.watchdog.editor` if `props.disableWatchdog` is set to false.
	 */
	watchdog: EditorWatchdog<TEditor> | EditorWatchdogAdapter<TEditor> | null;
};
