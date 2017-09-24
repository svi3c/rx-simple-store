import { Subscription } from "rxjs/Subscription";

import { RxStore } from "./store";

export interface Stores {
  [name: string]: RxStore<any>;
}

// tslint:disable-next-line:ban-types
const patch = (target: any, fnName: string, fn: Function) => {
  const originalFn = target[fnName];
  target[fnName] = function() {
    const result = fn.apply(this, arguments);
    if (originalFn) {
      return originalFn.apply(this, arguments);
    } else {
      return result;
    }
  };
};

export function connect(stores: Stores) {
  return (ComposedComponent: any) => {
    const initialState: any = {};
    Object.keys(stores).forEach(
      name => (initialState[name] = stores[name].state),
    );
    ComposedComponent.prototype.state = {
      ...(ComposedComponent.prototype.state || {}),
      ...initialState,
    };
    patch(ComposedComponent.prototype, "componentWillMount", function(
      this: any,
    ) {
      this.subscription = new Subscription();
      Object.keys(stores).forEach(name =>
        this.subscription.add(
          stores[name].subscribe(state => this.setState({ [name]: state })),
        ),
      );
    });
    patch(ComposedComponent.prototype, "componentWillUnmount", function(
      this: any,
    ) {
      this.subscription.unsubscribe();
    });
  };
}
