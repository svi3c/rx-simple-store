import { beforeEach, it } from "jasmine-promise-wrapper";
import { Action, RxStore } from "./index";

describe("RxStore", () => {

  let store: RxStore<any>;

  beforeEach(() => {
    store = new RxStore<any>((state: any, action: Action) => state, {});
  });

  it("should work", () => {
    expect(store).toBeDefined();
  });

});
