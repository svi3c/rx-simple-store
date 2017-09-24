[![Build Status](https://travis-ci.org/svi3c/rx-simple-store.svg?branch=master)](https://travis-ci.org/svi3c/rx-simple-store)

# rx-simple-store

This is an isomorphic distributed [rxjs 5](https://github.com/ReactiveX/RxJS) implementation of a reactive store, written in TypeScript.

## History

I was originally inspired by the article [Redux in a single line of code with RxJS](http://rudiyardley.com/redux-single-line-of-code-rxjs/) by Rudi Yardley.

Then I switched to a more [mobx](https://mobx.js.org/)-like implementation. I liked the idea of having actions as simple
methods on the store.

So in version 0.2.0 I did a rewrite:
Instead of working with actions as objects like in redux, we now add actions as methods to our store implementations.

## Why another store solution?

At the moment I write some applications in [Angular](https://angular.io/) and [React](https://facebook.github.io/react/).

* There is the [@ngrx/store](https://github.com/ngrx/store) or [redux](http://redux.js.org/docs/introduction/Motivation.html) which allows you to have a centralized application state.

  This is a nice solution for a lot of applications. With the great redux dev tools, you can keep track of your actions.

* On the other hand there is [mobx](https://mobx.js.org/) which is a distributed store and works with it's own observable implementation.

### Advantages

* In @ngrx/store and redux you have to create a lot of boilerplate code to finally get your store set-up and you have to jump through a lot of files when you want to change a behavior.

  With the RxStore you have everything from the actions to to the state within one file (like in mobx).

* Mobx is larger than this small library and it has it's own observable implementation which is unlikely to be reused by a library consumer.

  Since this library uses rxjs, it has a very small size (it's only one class).
  And rxjs is very light, too (when you include only the operators you need into your application).
  If you use Angular, you have rxjs as an implicit dependency anyways.

### Drawbacks

* Hot-Module-Reloading might be easier to be implemented with a central store solution.
* @ngrx/store and redux have an action history log and you can simply modify it with the dev tools to get a different resulting state. This is not a feature of mobx or this store.

## API

### RxStore

#### `constructor`

Creates a new store instance.
```ts
new RxStore<S>(initialState: S, options?: RxStoreOptions);
```

#### `RxStore.prototype.state`

This is a reference to the current state snapshot.

#### `RxStore.prototype.state$`

The `state$` is a rxjs `Observable<S>`. Here you can subscribe for state updates.

#### `RxStore.prototype.propagate(patch: Partial<S>)` (protected)

This is an internal method that can be used by your store actions to propagate state changes.

### `RxStoreOptions`

#### `debug?: boolean`

Determines whether the the state changes of the store are logged to the console.

#### `mutateState?: boolean`

Determines whether the state should be mutated when calling `propagate`.

## A Todo Example

```ts
import { RxStore } from "rx-simple-store";

interface Todo {
  text: string;
  done: boolean;
}

interface TodoState {
  todos: Todo[];
}

class TodoStore extends RxStore<TodoState> {
  addTodo(todo: Todo) {
    this.propagate({
      todos: [...this.state.todos, todo],
    });
  }

  updateTodo(idx: number, todo: Partial<Todo>) {
    const todos = this.state.todos;
    this.propagate({
      todos: [
        ...todos.slice(0, idx),
        Object.assign(todos[idx], todo),
        ...todos.slice(idx + 1),
      ],
    });
  }
}

const todoStore = new TodoStore({ todos: [] });

todoStore.addTodo({ text: "Read the docs", done: false });
todoStore.updateTodo(0, { done: true });
todoStore.addTodo({ text: "Use it", done: false });
todoStore.updateTodo(1, { text: "Apply it" });

// state:
// ​​​​​{​​​​​
// ​​​​​  "todos": [​​​​​
// ​​​​​    {​​​​​
// ​​​​​      "text": "Read the docs",​​​​​
// ​​​​​      "done": true​​​​​
// ​​​​​    },​​​​​
// ​​​​​    {​​​​​
// ​​​​​      "text": "Apply it",​​​​​
// ​​​​​      "done": false​​​​​
// ​​​​​    }​
// ​​​​​  ]​​​​​
// ​​​​​}​​​
```

## Usage with angular

In angular you can simply subclass the RxStore and inject it to your components.

### Example

Store (similar to example above):
```ts
// ...

@Injectable()
export class TodoStore extends RxStore<TodoState> {
  // ...
}
```

Component:

```ts
@Component({
  // ...
})
export class TodosComponent {
  todos$ = this.todoStore.state$.map(state => state.todos);

  constructor(public todoStore: TodoStore) {
  }
}
```


## Usage with react, inferno or preact

If you use react or a react-like library, you can connect a stateful component to a store by using the connect decorator.

### Example:

```ts
import { connect } from "rx-simple-store";

interface State {
  todos: TodoState;
}

@connect({ todos: todoStore })
export class Todos extends Component<{}, State> {
  render() {
    const todos = this.state.todos;
    return (
      <ul>
        {todos.todos.map(todo => (<li>{todo.text}</li>))}
      </ul>
    );
  }
}
```
