/**
 * @license Copyright (c) 2003-2022, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

import turnOffDefaultErrorCatching from '../_utils/turnoffdefaulterrorcatching';

describe( 'turnOffDefaultErrorCatching()', () => {
	it( 'should catch the error', () => {
		const onErrorStub = sinon.stub( window, 'onerror' );

		turnOffDefaultErrorCatching( () => {
			window.onerror( 'Foo', null, 0 );
		} );

		onErrorStub.restore();

		expect( onErrorStub.called ).to.equal( false );
	} );
} );
