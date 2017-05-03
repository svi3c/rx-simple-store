import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subject } from "rxjs/Subject";

import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/publishReplay";
import "rxjs/add/operator/scan";
import "rxjs/add/operator/startWith";

export type Partial<T> = {
    [P in keyof T]?: T[P];
};

export interface Action {
  type: string;
  payload?: any;
}

export type Reducer<S> = (state: S, action: Action) => S;

export const SET_ACTION_TYPE = "[RX_STORE] SET";

function extendReducer<S>(reducer: Reducer<S>) {
  return (state: S, action: Action) => {
    if (action.type === SET_ACTION_TYPE && typeof state === "object") {
      return { ...(state as any as object), ...action.payload };
    } else {
      return reducer(state, action);
    }
  };
}

export class RxStore<S> extends Observable<S> {

  state: S;
  readonly actions$: Subject<Action>;

  constructor(reducer: Reducer<S>, initialState: S) {
    const actions$ = new Subject<Action>();
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
    state$.subscribe((state) => {
      this.state = state;
    });
    this.actions$ = actions$;
  }

  dispatch(action: Action) {
    this.actions$.next(action);
  }

  set(partialState: Partial<S>) {
    this.dispatch({ type: SET_ACTION_TYPE, payload: partialState });
  }

}
