import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/scan";

export interface Action {
  type: string;
  payload?: any;
}

export type Reducer<S> = (state: S, action: Action) => S;

export class RxStore<S> {

  state$: Observable<S>;
  private actions$: Subject<Action> = new Subject<Action>();

  constructor(private reducer: Reducer<S>, initialState: S) {
    const stateSubject = new BehaviorSubject<S>(initialState);
    this.state$ = stateSubject.distinctUntilChanged();
    this.actions$.scan(reducer, initialState).subscribe(stateSubject);
  }

  dispatch(action: Action) {
    this.actions$.next(action);
  }

}
