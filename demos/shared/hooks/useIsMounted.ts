/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { useEffect, useState } from 'react';

export function useIsMounted(): boolean {
	const [ isMounted, setIsMounted ] = useState( false );

	useEffect( () => {
		setIsMounted( true );
	}, [] );

	return isMounted;
}
