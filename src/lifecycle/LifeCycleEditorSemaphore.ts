/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import type { EditorWatchdog } from '@ckeditor/ckeditor5-watchdog';

import type { EditorWatchdogAdapter } from '../ckeditor';
import type { LifeCycleElementSemaphore } from './LifeCycleElementSemaphore';

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

export type LifeCycleEditorSemaphore<TEditor extends Editor> = LifeCycleElementSemaphore<
	EditorSemaphoreMountResult<TEditor>
>;
