/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { ContextWatchdog, Editor } from 'ckeditor5';

export type WatchdogConstructor = { new( ...args: any ): ContextWatchdog };

export type WithWatchdogConstructorProperty = {
	ContextWatchdog: WatchdogConstructor;
};

export type EditorFactory<TEditor extends Editor = Editor> =
	& WithWatchdogConstructorProperty
	& {
		create( ...args: any ): Promise<TEditor>;
	};
