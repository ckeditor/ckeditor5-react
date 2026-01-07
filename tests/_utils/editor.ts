/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { EditorWatchdog, ContextWatchdog } from 'ckeditor5';

/**
 * Mock of class that representing a basic, generic editor.
 *
 * @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
 */
export default class MockEditor {
	public static EditorWatchdog: any = EditorWatchdog;
	public static ContextWatchdog: any = ContextWatchdog;

	// In order to tests events, we need to somehow mock those properties.
	public static _on = (): void => {};
	public static _once = (): void => {};

	public static _model = {
		document: createDocument(),
		markers: []
	};

	public static _editing = {
		view: {
			document: createDocument()
		}
	};

	public declare state?: string;
	public declare element?: HTMLElement;
	public declare config?: Record<string, any>;
	public declare model: any;
	public declare editing: any;
	public declare on: any;
	public declare once: any;
	public declare data: any;
	public declare createEditable: any;
	public declare ui: any;
	public declare plugins: Set<any>;
	public declare _readOnlyLocks: Set<any>;

	constructor( element?: HTMLElement, config?: Record<string, any> ) {
		this.element = element;
		this.config = config;

		this.initializeProperties();
	}

	public initializeProperties(): void {
		this.model = MockEditor._model;
		this.editing = MockEditor._editing;
		this.on = MockEditor._on;
		this.once = MockEditor._once;
		this.data = {
			get() {
				return '';
			},
			set() {

			}
		};
		this.createEditable = () => document.createElement( 'div' );
		this.ui = {
			getEditableElement() {
				return document.createElement( 'div' );
			}
		};
		this.plugins = new Set();
		this._readOnlyLocks = new Set();
	}

	public get isReadOnly(): boolean {
		return this._readOnlyLocks.size > 0;
	}

	public set isReadOnly( _: boolean ) {
		throw new Error( 'Cannot use this setter anymore' );
	}

	public enableReadOnlyMode( lockId: string ): void {
		this._readOnlyLocks.add( lockId );
	}

	public disableReadOnlyMode( lockId: string ): void {
		this._readOnlyLocks.delete( lockId );
	}

	public detachEditable(): Promise<void> {
		return Promise.resolve();
	}

	public destroy(): Promise<void> {
		return Promise.resolve();
	}

	// Implements the `DataApi` interface.
	// See: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_utils_dataapimixin-DataApi.html
	public setData( ...args: Array<any> ): void {
		return this.data.set.call( this, ...args );
	}

	public getData( ...args: Array<any> ): string {
		return this.data.get.call( this, ...args );
	}

	public static create( element?: HTMLElement, config?: Record<string, any> ): Promise<MockEditor> {
		return Promise.resolve( new this( element, config ) );
	}
}

function createDocument() {
	return {
		on() {},
		off() {},
		getRootNames() {
			return [ 'main' ];
		},
		differ: {
			getChanges() {
				return [];
			},
			getChangedRoots() {
				return [];
			}
		},
		roots: {
			filter() {
				return [ {
					getAttributes: () => {
						return {};
					},
					getChildren: () => {
						return [];
					},
					_isLoaded: false
				} ];
			}
		}
	};
}
