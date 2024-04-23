/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { createDefer, type Defer } from './defer';
import { once } from './once';

/**
 * This class is utilized to pause the initialization of an editor when another instance is already present on a specified element.
 * It is engineered to address the following issues:
 *
 *	* Rapid changes in component properties often lead to the re-initialization of the editor, which can trigger
 *	  the `editor-source-element-already-used` exception. This occurs because the editor is still in the process of initializing
 *	  when the component decides to destroy it. This semaphore waits for the editor to fully initialize before destroying it, thereby
 *	  allowing a new instance of the editor to be attached to the specified element.
 *
 *	* Rapid mounting and unmounting in strict mode frequently results in the `editor-source-element-already-used` exception
 *	  being thrown by the editor. This is due to React reusing the underlying DOM element during the mounting and unmounting of components
 *	  (especially if the same component is being mounted and unmounted). Consequently, a race condition arises. The first render begins to
 *	  attach the editor (in async mode), and shortly thereafter, it is destroyed and a new instance of the component is initialized.
 *	  This semaphore, by utilizing a static semaphores promises map, retains information about whether the element is used by a previous
 *	  instance of the editor and resumes execution when it is freed.
 *
 *	* The initialization of the editor is skipped when numerous rerenders occur within a short time-frame. An example of this
 *	  could be a situation with 4 rerenders occurring within a 10ms period. This semaphore will likely batch these calls, and
 *	  instead of initializing 4 editors, only 2 will be initialized (the first and the last one).
 */
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
	private _releaseLock: Defer<void> | null = null;

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
		this._lock();
	}

	/**
	 * Getter for {@link #_value}.
	 */
	public get value(): R | null {
		return this._value;
	}

	/**
	 * This method is used to inform other components that the {@link #_element} will be used by the editor,
	 * which is initialized by the {@link #_lifecycle} methods.
	 *
	 * 	* If an editor is already present on the provided element, the initialization of the current one
	 * 	  will be postponed until the previous one is destroyed.
	 *
	 * 	* If the element is empty and does not have an editor attached to it, the currently locked editor will
	 * 	  be mounted immediately.
	 *
	 * After the successful initialization of the editor and the assignment of the {@link #_value} member,
	 * the `onReady` lifecycle method is called.
	 */
	private _lock(): void {
		const { _semaphores } = LifeCycleEditorElementSemaphore;
		const { _state, _element, _lifecycle } = this;

		// This promise signifies that the previous editor is still attached to the current element.
		// Upon successful resolution, it will indicate that it is safe to assume that the element has
		// no assigned editor instance and can be reinitialized.
		const prevElementSemaphore = _semaphores.get( _element ) || Promise.resolve( null );

		// This is a lock that will be resolved after the `release` method is called. Due to this lock,
		// the promise will never be resolved until the editor is destroyed.
		const releaseLock = createDefer();

		// This is the initialization of the editor that occurs after the previous editor has been detached from the specified element.
		//
		// If the `release` method was called before the initialization of the current editor instance, then it will be skipped.
		// This situation occurs quite frequently when we have three or more rerenders in a row, and it doesn't make sense to initialize
		// the second editor because it will be overridden anyway by the third one.
		const newElementSemaphore = prevElementSemaphore
			.then( () => {
				if ( _state.destroyedBeforeInitialization ) {
					return Promise.resolve( undefined );
				}

				// This variable will be used later in the `release` method to determine
				// whether the editor is being destroyed prior to initialization.
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
			.then( () => releaseLock.promise );

		_semaphores.set( _element, newElementSemaphore );
		this._releaseLock = releaseLock;
	}

	public readonly release = once( () => {
		const { _semaphores } = LifeCycleEditorElementSemaphore;
		const { _releaseLock, _state, _element, _lifecycle } = this;

		if ( _state.mountingInProgress ) {
			const deletePromise = _state.mountingInProgress
				.then( mountResult => _lifecycle.unmount( {
					element: _element,
					mountResult
				} ) )
				.then( _releaseLock!.resolve )
				.then( () => {
					this._value = null;

					if ( _semaphores.get( _element ) === deletePromise ) {
						_semaphores.delete( _element );
					}
				} );

			_semaphores.set( _element, deletePromise );
		} else {
			_state.destroyedBeforeInitialization = true;
			_releaseLock!.resolve();
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
