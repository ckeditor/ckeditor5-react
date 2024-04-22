/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { createDefer, type Defer } from './defer';
import { once } from './once';

export class LifeCycleEditorElementSemaphore<R> {
	private static readonly _semaphores = new Map<HTMLElement, Promise<void>>();

	private readonly _lifecycle: LifeCycleAsyncOperators<R>;

	private readonly _element: HTMLElement;

	private _defer: Defer<void> | null = null;

	private _value: R | null = null;

	private _state: LifeCycleState<R> = {
		destroyedBeforeInitialization: false,
		mountingInProgress: null
	};

	constructor( element: HTMLElement, lifecycle: LifeCycleAsyncOperators<R> ) {
		this._element = element;
		this._lifecycle = lifecycle;
		this.lock();
	}

	public get value(): R | null {
		return this._value;
	}

	/**
	 * Locks semaphore on passed semaphore element. If element is locked then it is impossible
	 * to assign another editor instance without releasing previous one.
	 */
	private lock(): void {
		const { _semaphores } = LifeCycleEditorElementSemaphore;
		const { _state, _element, _lifecycle } = this;

		const defer = createDefer();
		const prevElementSemaphore = _semaphores.get( _element ) || Promise.resolve( null );
		const newElementSemaphore = prevElementSemaphore
			.then( () => {
				if ( _state.destroyedBeforeInitialization ) {
					return Promise.resolve( undefined );
				}

				_state.mountingInProgress = _lifecycle.mount();
				return _state.mountingInProgress;
			} )
			.then( async mountResult => {
				if ( mountResult ) {
					this._value = mountResult;

					if ( _lifecycle.afterMount ) {
						await _lifecycle.afterMount( {
							element: _element,
							mountResult
						} );
					}
				}
				return mountResult;
			} )
			.then( () => defer.promise );

		_semaphores.set( _element, newElementSemaphore );
		this._defer = defer;
	}

	public readonly release = once( () => {
		const { _semaphores } = LifeCycleEditorElementSemaphore;
		const { _defer, _state, _element, _lifecycle } = this;

		if ( _state.mountingInProgress ) {
			const deletePromise = _state.mountingInProgress
				.then( mountResult => _lifecycle.unmount( {
					element: _element,
					mountResult
				} ) )
				.then( _defer!.resolve )
				.then( () => {
					this._value = null;

					if ( _semaphores.get( _element ) === deletePromise ) {
						_semaphores.delete( _element );
					}
				} );

			_semaphores.set( _element, deletePromise );
		} else {
			_state.destroyedBeforeInitialization = true;
			_defer!.resolve();
		}
	} );
}

type LifeCycleState<R> = {
	destroyedBeforeInitialization: boolean;
	mountingInProgress: Promise<R> | null;
};

type LifeCyclePostMountAttrs<R> = {
	element: HTMLElement;
	mountResult: R;
};

type LifeCycleAsyncOperators<R> = {
	mount: () => Promise<R>;
	afterMount?: ( result: LifeCyclePostMountAttrs<R> ) => Promise<void> | void;
	unmount: ( result: LifeCyclePostMountAttrs<R> ) => Promise<void>;
};
