/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import Context from '../_utils/context.js';

describe( 'Context', () => {
	describe( 'constructor()', () => {
		it( 'saves the config', () => {
			const config = { foo: 'bar' };
			const context = new Context( config );

			expect( context.config ).to.equal( config );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should return a promise that resolves properly', () => {
			return Context.create()
				.then( context => {
					const promise = context.destroy();

					expect( promise ).to.be.an.instanceof( Promise );

					return promise;
				} );
		} );
	} );

	describe( 'create()', () => {
		it( 'should return a promise that resolves properly', () => {
			const promise = Context.create();

			expect( promise ).to.be.an.instanceof( Promise );

			return promise;
		} );
	} );
} );
