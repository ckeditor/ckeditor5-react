/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { createDefer, type Defer } from '../utils/defer';
import { once } from '../utils/once';

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
 *	* The process involves starting up many editors that are no longer needed and are immediately removed in the following rerenders.
 *	  This can cause the editor’s initialization performance to slow down. The initialization of the editor is skipped when numerous
 *	  rerenders occur within a short time-frame while using this semaphore. An example of this could be a situation with 4 rerenders
 *	  occurring within a 10ms period. This semaphore will likely batch these calls, and instead of initializing 4 editors, only 2 will be
 *	  initialized (the first and the last one).
 */
export class LifeCycleElementSemaphore<R> {
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
	 * This is a list of callbacks that are triggered if the semaphore {@link #_lifecycle:mount} method executes successfully.
	 * It is utilized in scenarios where we need to assign certain properties to an editor that is currently in the process of mounting.
	 * An instance of such usage could be two-way binding. We aim to prevent the loss of all `setData` calls if the editor has not
	 * yet been mounted, therefore these calls will be executed immediately following the completion of the mounting process.
	 */
	private _afterMountCallbacks: Array<LifeCycleAfterMountCallback<R>> = [];

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
	 * Occasionally, the Watchdog restarts the editor instance, resulting in a new instance being assigned to the semaphore.
	 * In terms of race conditions, it's generally safer to simply override the semaphore value rather than recreating it
	 * with a different one.
	 */
	public unsafeSetValue( value: R ): void {
		this._value = value;

		this._afterMountCallbacks.forEach( callback => callback( value ) );
		this._afterMountCallbacks = [];
	}

	/**
	 * This registers a callback that will be triggered after the editor has been successfully mounted.
	 *
	 * 	* If the editor is already mounted, the callback will be executed immediately.
	 *	* If the editor is in the process of mounting, the callback will be executed upon successful mounting.
	* 	* If the editor is never mounted, the passed callback will not be executed.
	* 	* If an exception is thrown within the callback, it will be re-thrown in the semaphore.
	*/
	public runAfterMount( callback: LifeCycleAfterMountCallback<R> ): void {
		const { _value, _afterMountCallbacks } = this;

		if ( _value ) {
			callback( _value );
		} else {
			_afterMountCallbacks.push( callback );
		}
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
	 *
	 * *Important note:*
	 *
	 * It’s really important to keep this method *sync*. If we make this method *async*, it won’t work well because
	 * it will cause problems when we’re trying to set up the {@link LifeCycleEditorElementSemaphore#_semaphores} map entries.
	 */
	private _lock(): void {
		const { _semaphores } = LifeCycleElementSemaphore;
		const { _state, _element, _lifecycle } = this;

		// This promise signifies that the previous editor is still attached to the current element.
		// Upon successful resolution, it will indicate that it is safe to assume that the element has
		// no assigned editor instance and can be reinitialized.
		const prevElementSemaphore = _semaphores.get( _element ) || Promise.resolve( null );

		// This is a lock that will be resolved after the `release` method is called. Due to this lock,
		// the promise will never be resolved until the editor is destroyed.
		const releaseLock = createDefer();
		this._releaseLock = releaseLock;

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
				_state.mountingInProgress = _lifecycle.mount().then( mountResult => {
					if ( mountResult ) {
						this.unsafeSetValue( mountResult );
					}

					return mountResult;
				} );

				return _state.mountingInProgress;
			} )
			.then( async mountResult => {
				// Everything is fine, all ready callback might be fired here.
				if ( mountResult && _lifecycle.afterMount ) {
					await _lifecycle.afterMount( {
						element: _element,
						mountResult
					} );
				}
			} )

			// It will be released after destroying of editor by the {@link #_release method}.
			.then( () => releaseLock.promise )

			// Prevent hanging of semaphore during mount, just assume that everything is fine
			.catch( error => {
				console.error( 'Semaphore mounting error:', error );
			} )

			// Remove semaphore from map if released.
			.then( () => {
				if ( _semaphores.get( _element ) === newElementSemaphore ) {
					_semaphores.delete( _element );
				}
			} );

		_semaphores.set( _element, newElementSemaphore );
	}

	/**
	 * Inverse of {@link #_lock} method that tries to destroy attached editor.
	 *
	 * 	* If editor is being already attached to element (or is in attaching process) then after fully initialization of editor
	 * 	  destroy is performed and semaphore is released. The {@link #_lifecycle} unmount method is called.
	 *
	 * 	* If editor is being destroyed before initialization then it does nothing but sets `destroyedBeforeInitialization` flag that
	 * 	  will be later checked by {@link #_lock} method in initialization. The {@link #_lifecycle} unmount method is not called.
	 *
	 * *Important note:*
	 *
	 * It’s really important to keep this method *sync*. If we make this method *async*, it won’t work well because
	 * it will cause problems when we’re trying to set up the {@link LifeCycleEditorElementSemaphore#_semaphores} map entries.
	 */
	public readonly release = once( () => {
		const { _releaseLock, _state, _element, _lifecycle } = this;

		if ( _state.mountingInProgress ) {
			_state.mountingInProgress
				.then( () => _lifecycle.unmount( {
					element: _element,

					// Mount result might be overridden by watchdog during restart so use instance variable.
					mountResult: this.value!
				} ) )

				// Prevent hanging of semaphore during unmount, just assume that everything is fine
				.catch( error => {
					console.error( 'Semaphore unmounting error:', error );
				} )

				.then( _releaseLock!.resolve )
				.then( () => {
					this._value = null;
				} );
		} else {
			_state.destroyedBeforeInitialization = true;
			_releaseLock!.resolve();
		}
	} );
}

export type LifeCycleAfterMountCallback<R> = ( mountResult: R ) => void;

type LifeCycleState<R> = {
	destroyedBeforeInitialization: boolean;
	mountingInProgress: Promise<R> | null;
};

type LifeCyclePostMountAttrs<R> = {
	element: HTMLElement;
	mountResult: R;
};

export type LifeCycleAsyncOperators<R> = {
	mount: () => Promise<R>;
	afterMount?: ( result: LifeCyclePostMountAttrs<R> ) => Promise<void> | void;
	unmount: ( result: LifeCyclePostMountAttrs<R> ) => Promise<void>;
};
