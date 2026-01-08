/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Context } from 'ckeditor5';
import { createDefer } from './defer.js';

/**
 * Mock of class that representing the Context feature.
 *
 * @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_context-Context.html
 */
export default class ContextMock {
	public config: any;

	constructor( config: any ) {
		this.config = config;
	}

	public static create( config?: ConstructorParameters<typeof ContextMock> ): Promise<Context> {
		return Promise.resolve( new ContextMock( config ) as Context );
	}

	public destroy(): Promise<void> {
		return Promise.resolve();
	}
}

/**
 * A mock class representing a deferred context.
 */
export class DeferredContextMock {
	public static create(): any {
		const defer = createDefer();

		return {
			defer,
			create: ( ...args: ConstructorParameters<typeof ContextMock> ) => defer.promise.then( () => new ContextMock( ...args ) )
		};
	}
}
