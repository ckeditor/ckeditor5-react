/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { useEffect, useRef } from 'react';

export function useExecuteAfterRender(): ( callback: VoidFunction ) => void {
	const queueRef = useRef<Array<VoidFunction>>( [] );

	useEffect( () => {
		for ( const callback of queueRef.current ) {
			callback();
		}

		queueRef.current = [];
	} );

	return ( callback: VoidFunction ) => {
		queueRef.current.push( callback );
	};
}
