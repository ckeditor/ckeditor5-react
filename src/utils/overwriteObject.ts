/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Clears whole object while keeping its reference.
 */
export function overwriteObject<O extends Record<string, any>>( source: O, destination: O ): O {
	for ( const prop of Object.getOwnPropertyNames( destination ) ) {
		delete destination[ prop ];
	}

	// Prevent assigning self referencing attributes which crashes `Object.assign`.
	for ( const [ key, value ] of Object.entries( source ) ) {
		if ( value !== destination && key !== 'prototype' && key !== '__proto__' ) {
			( destination as any )[ key ] = value;
		}
	}

	return destination;
}
