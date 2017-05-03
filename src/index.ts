import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subject } from "rxjs/Subject";

import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/publishReplay";
import "rxjs/add/operator/scan";
import "rxjs/add/operator/startWith";

export interface Action {
  type: string;
  payload?: any;
}

export type Reducer<S> = (state: S, action: Action) => S;

export class RxStore<S> extends Observable<S> {

  state: S;
  readonly actions$: Subject<Action>;

  constructor(reducer: Reducer<S>, initialState: S) {
    const actions$ = new Subject<Action>();
    const state$ = actions$
      .scan(reducer, initialState)
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

}
