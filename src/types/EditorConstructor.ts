/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorWatchdog, ContextWatchdog, Editor } from 'ckeditor5';

export type EditorConstructor<TEditor extends Editor = Editor> = {
	create( ...args: any ): Promise<TEditor>;
	EditorWatchdog: typeof EditorWatchdog;
	ContextWatchdog: typeof ContextWatchdog;
	editorName?: string;
};
