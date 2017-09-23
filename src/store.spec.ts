import "rxjs/add/operator/take";

import { RxStore } from "./store";

class TestStore extends RxStore<any> {
  someAction() {
    this.propagate({ b: 2 });
  }
}

describe("RxStore", () => {
  describe("actions", () => {
    it("should change the store's state", () => {
      const testStore = new TestStore({ a: 1 });

      testStore.someAction();
      expect(testStore.state).toEqual({
        a: 1,
        b: 2,
      });
    });
  });
});
