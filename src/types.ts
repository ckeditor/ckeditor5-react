/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { ContextWatchdog, Editor } from 'ckeditor5';

export type Optional<T> = T | null | undefined;

export type OptionalRecord<R extends object> = {
	[K in keyof R]?: Optional<R[K]>;
};

export type WithWatchdogConstructorProperty = {
	ContextWatchdog: { new( ...args: any ): ContextWatchdog };
};

export type EditorFactory<TEditor extends Editor> =
	& WithWatchdogConstructorProperty
	& {
		create( ...args: any ): Promise<TEditor>;
	};
