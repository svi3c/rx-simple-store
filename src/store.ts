import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";

export interface RxStoreOptions {
  debug?: boolean;
  mutateState?: boolean;
}

/**
 * This abstract store is basically just holding a state and propagating state changes.
 * Whether this state is treated mutable or immutable is up to you.
 */
export abstract class RxStore<S extends object> {
  readonly state$: Observable<S>;
  private stateSubject: BehaviorSubject<S>;

  get state() {
    return this.stateSubject.value;
  }

  constructor(initialState: S, private options: RxStoreOptions = {}) {
    this.stateSubject = new BehaviorSubject(initialState);
    this.state$ = this.stateSubject.asObservable();
  }

  /**
   * You should use this method to propagate state changes to your application.
   * There are two ways to use this method:
   * 1. The mutable way:
   *   You apply changes to the state object and then call this method without
   *   parameters.
   * 2. The immutable way:
   *   You pass in a partial state which reflects the state changes.
   * @param patch This partial state will be merged into the new resulting state.
   */
  protected propagate(patch: Partial<S>) {
    // tslint:disable-next-line:prefer-object-spread
    const state = this.options.mutateState
      ? Object.assign(this.state, patch)
      : Object.assign({}, this.state, patch);
    if (this.options.debug) {
      // tslint:disable-next-line:no-console
      console.debug(`State changed [${this.constructor.name}]:`, state);
    }
    this.stateSubject.next(state);
  }
}
