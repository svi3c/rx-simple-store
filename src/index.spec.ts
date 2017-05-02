import { it } from "jasmine-promise-wrapper";
import { Action, RxStore } from "./index";

import "rxjs/add/operator/delay";
import "rxjs/add/operator/take";
import "rxjs/add/operator/toPromise";
import { Subscription } from "rxjs/Subscription";

describe("RxStore", () => {

  let store: RxStore<any>;
  let subscription: Subscription;

  afterEach(() => {
    if (subscription && !subscription.closed) {
      subscription.unsubscribe();
    }
  });

  it("should expose the current state", () => {
    store = new RxStore<number>((state, action: Action) => action.payload, 0);

    const val1 = store.state;
    store.dispatch({ type: "foo", payload: 1 });
    const val2 = store.state;

    expect(val1).toEqual(0);
    expect(val2).toEqual(1);
  });

  describe("one observer", () => {

    it("should be notified with the current state on subscription", async () => {
      store = new RxStore<number>((state, action: Action) => state, 0);

      const initial = await store.take(1).toPromise();

      expect(initial).toEqual(0);
    });

    it("should be notified when a new state is returned", async () => {
      store = new RxStore<number>((state, action: Action) => action.payload, 0);

      store.dispatch({ type: "foo", payload: 1 });
      const updated = await store.delay(100).take(1).toPromise();

      expect(updated).toEqual(1);
    });

    it("should not be notified when the same state object is returned", () => {
      let count = 0;
      store = new RxStore<{ foo: number }>((state, action: Action) => {
        state.foo = action.payload;
        return state;
      }, { foo: 0 });

      subscription = store.subscribe(() => {
        count++;
      });

      store.dispatch({ type: "foo", payload: 1 });
      store.dispatch({ type: "foo", payload: 2 });
      store.dispatch({ type: "foo", payload: 3 });

      expect(count).toEqual(1);
    });

  });

  describe("multiple observers", () => {

    it("should be notified with the current state on subscription", async () => {
      store = new RxStore<number>((state, action: Action) => state, 0);

      const initial1 = await store.take(1).toPromise();
      const initial2 = await store.take(1).toPromise();

      expect(initial1).toEqual(0);
      expect(initial1).toEqual(0);
    });

    it("should be notified when new states are returned", async () => {
      const states1: number[] = [];
      const states2: number[] = [];
      store = new RxStore<number>((state, action: Action) => action.payload, 0);
      const sub1 = store.subscribe((state) => {
        states1.push(state);
      });
      const sub2 = store.subscribe((state) => {
        states2.push(state);
      });
      subscription = sub1.add(sub2);

      store.dispatch({ type: "foo", payload: 1 });
      store.dispatch({ type: "foo", payload: 2 });
      store.dispatch({ type: "foo", payload: 3 });

      expect(states1).toEqual([0, 1, 2, 3]);
      expect(states2).toEqual([0, 1, 2, 3]);
    });

  });

});
