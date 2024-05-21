/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export type Optional<T> = T | null | undefined;

export type OptionalRecord<R extends object> = {
	[K in keyof R]?: Optional<R[K]>;
};
