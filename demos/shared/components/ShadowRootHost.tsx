/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useCallback, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders its children inside a shadow root.
 */
export function ShadowRootHost( {
	mode = 'open',
	adoptedStyleSheets = () => [],
	children
}: ShadowRootHostProps ): ReactNode {
	const [ mount, setMount ] = useState<Mount | null>( null );

	const hostRef = useCallback( ( host: HTMLDivElement | null ) => {
		if ( host ) {
			setMount( attachShadowRoot( host, mode, adoptedStyleSheets() ) );
		}
	}, [ mode, adoptedStyleSheets ] );

	return (
		<div ref={ hostRef }>
			{ mount && createPortal(
				typeof children === 'function' ? children( mount.shadowRoot ) : children,
				mount.container
			) }
		</div>
	);
}

type ShadowRootHostProps = {

	/**
	 * The mode of the shadow root.
	 *
	 * @default 'open'
	 */
	mode?: ShadowRootMode;

	/**
	 * Stylesheets adopted by the shadow root before the children are rendered, so there is no
	 * unstyled frame. Called once, when the root is attached.
	 */
	adoptedStyleSheets?: () => Array<CSSStyleSheet>;

	/**
	 * What to render inside the shadow root. Pass a function to get hold of the root itself.
	 */
	children: ReactNode | ( ( shadowRoot: ShadowRoot ) => ReactNode );
};

const MOUNT_SYMBOL = Symbol.for( 'ckeditor-demo-shadow-root-mount' );

type HostElement = HTMLDivElement & { [ MOUNT_SYMBOL ]?: Mount };

/**
 * Attaches a shadow root to the host, or returns the one attached earlier.
 */
function attachShadowRoot(
	host: HostElement,
	mode: ShadowRootMode,
	adoptedStyleSheets: Array<CSSStyleSheet>
): Mount {
	if ( !host[ MOUNT_SYMBOL ] ) {
		const shadowRoot = host.attachShadow( { mode } );

		shadowRoot.adoptedStyleSheets = adoptedStyleSheets;

		host[ MOUNT_SYMBOL ] = {
			shadowRoot,
			container: shadowRoot.appendChild( document.createElement( 'div' ) )
		};
	}

	return host[ MOUNT_SYMBOL ];
}

type Mount = {
	shadowRoot: ShadowRoot;
	container: HTMLElement;
};
