/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { MutableRefObject } from 'react';

type CallbackRef<T> = ( element: T ) => void;

type ReactRef<T> = CallbackRef<T | null> | MutableRefObject<T | null> | null;

export function mergeRefs<T>( ...refs: Array<ReactRef<T>> ): CallbackRef<T> {
	return value => {
		refs.forEach( ref => {
			if ( typeof ref === 'function' ) {
				ref( value );
			} else if ( ref != null ) {
				ref.current = value;
			}
		} );
	};
}
