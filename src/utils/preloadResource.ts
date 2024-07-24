/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Appends a `<link>` element to the `<head>` to preload a resource.
 *
 * 	* It should detect if the resource is already preloaded.
 * 	* It should detect type of the resource and set the `as` attribute accordingly.
 */
export function preloadResource( url: string ): void {
	if ( document.head.querySelector( `link[href="${ url }"][rel="preload"]` ) ) {
		return;
	}

	const link = document.createElement( 'link' );

	link.setAttribute( 'injected-by', 'ck-editor-react' );
	link.rel = 'preload';
	link.as = detectTypeOfResource( url );
	link.href = url;

	document.head.appendChild( link );
}

/**
 * Detects the type of the resource based on its URL.
 */
function detectTypeOfResource( url: string ): string {
	switch ( true ) {
		case /\.css$/.test( url ):
			return 'style';

		case /\.js$/.test( url ):
			return 'script';

		default:
			return 'fetch';
	}
}
