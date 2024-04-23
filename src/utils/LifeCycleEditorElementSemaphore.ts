/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { createDefer, type Defer } from './defer';
import { once } from './once';

export class LifeCycleEditorElementSemaphore<R> {
	/**
	 * This is a map of elements associated with promises. It informs the semaphore that the underlying HTML element, used as a key,
	 * is currently in use by another editor. Each element is assigned a promise, which allows for the easy chaining of new
	 * editor instances on an element that is already in use by another instance. The process works as follows:
	 *
	 * 	1. If an element is being used by an editor, then the initialization of a new editor
	 * 	   instance is chained using the `.then()` method of the Promise.
	 *
	 * 	2. If the editor associated with the underlying element is destroyed, then `Promise.resolve()` is called
	 * 	   and the previously assigned `.then()` editor callback is executed.
	 *
	 *  @see {@link #lock} for more detailed information on the implementation.
	 */
	private static readonly _semaphores = new Map<HTMLElement, Promise<void>>();

	/**
	 * This should define async methods for initializing and destroying the editor.
	 * Essentially, it's an async version of basic React lifecycle methods like `componentDidMount`, `componentWillUnmount`.
	 *
	 * 	* Result of {@link LifeCycleAsyncOperators#mount} method is passed to {@link LifeCycleAsyncOperators#unmount} as an argument.
	 */
	private readonly _lifecycle: LifeCycleAsyncOperators<R>;

	/**
	 * This is the element instance that the editor uses for mounting. This element should contain the `ckeditorInstance` member
	 * once the editor has been successfully mounted to it. The semaphore ensures that a new instance of the editor, which will
	 * be assigned to this element by the {@link #_lifecycle:mount} method, will always be initialized after the successful
	 * destruction of the underlying `ckeditorInstance` that was previously mounted on this element.
	 */
	private readonly _element: HTMLElement;

	/**
	 * This is the lock mechanism utilized by the {@link #lock} and {@link #release} methods.
	 *
	 * 	* If the editor is not yet mounted and is awaiting mounting (for instance, when another editor is
	 * 	  occupying the element), then it is null.
	 *
	 * 	* When the editor is mounted on the element, this variable holds an unresolved promise that will be
	 * 	  resolved after the editor is destroyed.
	 *
	 * 	* Once the editor is destroyed (and it was previously mounted), the promise is resolved.
	 */
	private _defer: Defer<void> | null = null;

	/**
	 * This is the result of the {@link #_lifecycle:mount} function. This value should be reset to `null`
	 * once the semaphore is released. It is utilized to store certain data that must be removed following
	 * the destruction of the editor. This data may include the editor's instance, the assigned watchdog,
	 * or handles for additional window listeners.
	 */
	private _value: R | null = null;

	/**
	 * This represents the actual mounting state of the semaphore. It is primarily used by the {@link #release} method to
	 * determine whether the initialization of the editor should be skipped or, if the editor is already initialized, the editor
	 * should be destroyed.
	 *
	 * 	* If `destroyedBeforeInitialization` is true, then the {@link #release} method was invoked before the editor began to mount.
	 * 	  This often occurs in strict mode when we assign a promise to the {@link LifeCycleEditorElementSemaphore#_semaphores} map
	 * 	  and the assigned `mount` callback has not yet been called. In this scenario, it is safe to skip the initialization of the editor
	 * 	  and simply release the semaphore.
	 *
	 *	* If `mountingInProgress` is a Promise, then the {@link #release} method was invoked after the initialization of the editor and
	 	  the editor must be destroyed before the semaphore is released.
	*/
	private _state: LifeCycleState<R> = {
		destroyedBeforeInitialization: false,
		mountingInProgress: null
	};

	constructor( element: HTMLElement, lifecycle: LifeCycleAsyncOperators<R> ) {
		this._element = element;
		this._lifecycle = lifecycle;
		this.lock();
	}

	/**
	 * Getter for {@link #_value}.
	 */
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
