import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subject } from "rxjs/Subject";

import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/publishReplay";
import "rxjs/add/operator/scan";
import "rxjs/add/operator/startWith";

export type Partial<T> = { [P in keyof T]?: T[P] };

export interface Action {
  type: string;
  payload?: any;
}

export type Reducer<S, A extends Action> = (state: S, action: A) => S;

export interface SetAction {
  type: "[RX_STORE] SET";
  payload: any;
}

function extendReducer<S, A extends Action>(reducer: Reducer<S, A>) {
  return (state: S, action: A | SetAction) => {
    if (action.type === "[RX_STORE] SET") {
      if (typeof state === "object") {
        return { ...((state as any) as object), ...action.payload };
      } else {
        throw new Error("Cannot use setter on store with non-object state");
      }
    } else {
      return reducer(state, action as A);
    }
  };
}

export class RxStore<S, A extends Action> extends Observable<S> {
  state: S;
  readonly actions$: Subject<A>;

  constructor(reducer: Reducer<S, A>, initialState: S) {
    const actions$ = new Subject<A>();
    const state$ = actions$
      .scan(extendReducer(reducer), initialState)
      // Publish initial state
      .startWith(initialState)
      // Do not publish in-place mutations
      .distinctUntilChanged()
      // Cache the current state
      .publishReplay(1)
      .refCount();
    super((observer: Observer<S>) => {
      state$.subscribe(observer);
    });
    state$.subscribe(state => {
      this.state = state;
    });
    this.actions$ = actions$;
  }

  dispatch(action: A) {
    this.actions$.next(action);
  }

  set(partialState: Partial<S>) {
    this.dispatch({ type: "[RX_STORE] SET", payload: partialState } as A);
  }
}
