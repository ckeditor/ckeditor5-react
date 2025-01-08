/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export class PromiseManager {
	public promises: Array<Promise<any>> = [];

	public resolveOnRun<T extends Function>( cb?: T ): () => T {
		let resolve: Function | null = null;
		const promies = new Promise( res => {
			resolve = res;
		} );

		this.promises.push( promies );

		return ( ...args: Array<any> ) => resolve?.( cb?.( ...args ) );
	}

	public async all(): Promise<void> {
		await Promise.all( this.promises );
	}

	public clear(): void {
		this.promises = [];
	}
}
