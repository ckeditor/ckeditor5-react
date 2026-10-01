/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { type ReactNode } from 'react';

const MODES: Array<ShadowRootMode> = [ 'open', 'closed' ];

type ShadowRootModeSelectProps = {
	value: ShadowRootMode;
	onChange: ( mode: ShadowRootMode ) => void;
};

/**
 * Picks the mode of the shadow root the demo renders into.
 */
export function ShadowRootModeSelect( { value, onChange }: ShadowRootModeSelectProps ): ReactNode {
	return (
		<p>
			Shadow root mode{ ' ' }
			<select
				value={ value }
				onChange={ event => onChange( event.target.value as ShadowRootMode ) }
			>
				{ MODES.map( item => (
					<option key={ item } value={ item }>{ item }</option>
				) ) }
			</select>
		</p>
	);
}
