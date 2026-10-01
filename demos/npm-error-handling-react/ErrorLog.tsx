/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React from 'react';

export type Report = {
	id: string;
	at: string;
	from: string;
	phase: string;
	message: string;
};

/**
 * Builds a report for the list below. Kept here so that every scenario records the same things.
 */
export function toReport( from: string, error: Error, phase: string, count: number ): Report {
	return {
		id: `${ Date.now() }-${ count }`,
		at: new Date().toLocaleTimeString(),
		from,
		phase,
		message: error.message.split( '\n' )[ 0 ]
	};
}

/**
 * Throws from a timeout, so that the error escapes as an uncaught one — the path a real error takes.
 * Whatever is passed as the context is what ties the error to an editor or a context.
 *
 * Remove it in an actual integration; it exists only to give these demos something to report.
 */
export function simulateErrorFrom( context: unknown ): void {
	setTimeout( () => {
		const error: any = new Error( 'simulated-error' );

		error.context = context;
		error.is = () => true;

		throw error;
	} );
}

export default function ErrorLog( props: { reports: Array<Report>; onClear: () => void } ): JSX.Element {
	return (
		<>
			<h3>Reported errors</h3>

			<button type="button" onClick={ props.onClear }>Clear</button>

			{ props.reports.length === 0 ?
				<p><em>Nothing reported yet.</em></p> :
				<ol>
					{ props.reports.map( entry => (
						<li key={ entry.id }>
							{ entry.at } · <strong>{ entry.from }</strong> · { entry.phase } · { entry.message }
						</li>
					) ) }
				</ol>
			}
		</>
	);
}
