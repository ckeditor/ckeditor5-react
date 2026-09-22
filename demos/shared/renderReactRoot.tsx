/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { type ComponentType } from 'react';

export async function renderReactRoot( Component: ComponentType ): Promise<void> {
	const element = document.getElementById( 'root' ) as HTMLDivElement;

	if ( __REACT_VERSION__ <= 17 ) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const ReactDOM = await import( 'react-dom' );

		ReactDOM.render( React.createElement( Component ), element );
	} else {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const { createRoot } = await import( 'react-dom/client' );

		createRoot( element ).render( <Component /> );
	}

	console.log( `%cVersion of React used: ${ React.version }`, 'color:red;font-weight:bold;' );
}
