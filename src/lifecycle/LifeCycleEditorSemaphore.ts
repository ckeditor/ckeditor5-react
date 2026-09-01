/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Editor } from 'ckeditor5';

import type { LifeCycleElementSemaphore } from './LifeCycleElementSemaphore.js';

export type EditorSemaphoreMountResult<TEditor extends Editor> = {

	/**
	 * The editor instance. It is created once and stays the same for as long as the semaphore is mounted.
	 */
	instance: TEditor;
};

export type LifeCycleEditorSemaphore<TEditor extends Editor> = LifeCycleElementSemaphore<
	EditorSemaphoreMountResult<TEditor>
>;
