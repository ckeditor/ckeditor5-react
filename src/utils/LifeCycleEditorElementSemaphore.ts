/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { createDefer, type Defer } from './defer';
import { once } from './once';

export class LifeCycleEditorElementSemaphore {
	private static readonly _semaphores = new Map<HTMLElement, Promise<void>>();

	private readonly _lifecycle: LifeCycleAsyncOperators;

	private readonly _element: HTMLElement;

	private _defer: Defer<void> | null = null;

	private _state: LifeCycleState = {
		destroyedBeforeInitialization: false,
		mountingInProgress: null
	};

	constructor( element: HTMLElement, lifecycle: LifeCycleAsyncOperators ) {
		this._element = element;
		this._lifecycle = lifecycle;
	}

	public static ofLock( element: HTMLElement, lifecycle: LifeCycleAsyncOperators ): LifeCycleSemaphoreUnlock {
		return new LifeCycleEditorElementSemaphore( element, lifecycle ).lock();
	}

	/**
	 * Locks semaphore on passed semaphore element. If element is locked then it is impossible
	 * to assign another editor instance without releasing previous one.
	 */
	public lock(): LifeCycleSemaphoreUnlock {
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
			.then( () => defer.promise );

		_semaphores.set( _element, newElementSemaphore );
		this._defer = defer;

		return once( this._release );
	}

	private readonly _release = () => {
		const { _semaphores } = LifeCycleEditorElementSemaphore;
		const { _defer, _state, _element, _lifecycle } = this;

		if ( _state.mountingInProgress ) {
			const deletePromise = _state.mountingInProgress
				.then( () => _lifecycle.unmount( _element ) )
				.then( _defer!.resolve )
				.then( () => {
					if ( _semaphores.get( _element ) === deletePromise ) {
						_semaphores.delete( _element );
					}
				} );

			_semaphores.set( _element, deletePromise );
		} else {
			_state.destroyedBeforeInitialization = true;
			_defer!.resolve();
		}
	};
}

export type LifeCycleSemaphoreUnlock = VoidFunction;

type LifeCycleState = {
	destroyedBeforeInitialization: boolean;
	mountingInProgress: Promise<void> | null;
};

type LifeCycleAsyncOperators = {
	mount: () => Promise<void>;
	unmount: ( element: HTMLElement ) => Promise<void>;
};
