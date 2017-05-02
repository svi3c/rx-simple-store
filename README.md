# rx-simple-store

This is a simple [rxjs 5](https://github.com/ReactiveX/RxJS) isomorphic implementation of a reactive store, written in TypeScript.

I was inspired by the article [Redux in a single line of code with RxJS](http://rudiyardley.com/redux-single-line-of-code-rxjs/) by Rudi Yardley.

### What is a reactive store?

A reactive store is an application state management solution. It consumes actions and publishes new states via Observables. This way you can react on state changes accross your application.

To get a better understanding of reactive stores, take a look at [redux](http://redux.js.org/docs/introduction/).

### Why another store solution?

At the moment I write some applications in [Angular](https://angular.io/). There is the [@ngrx/store](https://github.com/ngrx/store) which allows you to have one large application state.

This is fine for apps. But if you want to write reusable Angular modules with components and services, you might consider to have dedicated stores for your independent modules.

### RxStore

The class that you will be working with is called `RxStore`. It is an Observable with a `dispatch()` method. If you want to react to changes, you can subscribe to it and if you want to trigger a state recalculation, you can `dispatch()` an `Action`. It also holds a reference to the current `state` to gain quick access.

The constructor takes a `Reducer` function and an `initialState` object.
The `Reducer` function handles the actions and may derive and return a new succeding state that will be stored and published.

It is important to treat the state *immutable*. To achieve this, I recommend to use the spread operator for [arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator) and [objects](http://redux.js.org/docs/recipes/UsingObjectSpreadOperator.html) (ES6, supported by Babel and TypeScript).

Since the reducer is a pure function, it is quite easy to test.

### A Todo Example

```ts
import { RxStore } from "rx-simple-store";

interface Todo {
  text: string;
  done: boolean;
}

type TodoState = {
  todos: Todo[];
};

interface AddTodoAction {
  type: "ADD_TODO";
  payload: Todo;
}

interface ToggleTodoAction {
  type: "TOGGLE_TODO";
  payload: string;
}

interface RemoveTodoByNameAction {
  type: "REMOVE_TODO";
  payload: string;
}

type TodoAction = AddTodoAction | ToggleTodoAction | RemoveTodoByNameAction;

const reducer = (state: TodoState, action: TodoAction) => {
  switch (action.type) {
    case "ADD_TODO":
      return {todos: [...state.todos, action.payload]};
    case "TOGGLE_TODO":
      const toggleIndex = state.todos.findIndex((todo) => todo.text === action.payload);    
      const todo = state.todos[toggleIndex];
      return {
        todos: [
          ...state.todos.slice(0, toggleIndex),
          {...todo, done: !todo.done},
          ...state.todos.slice(toggleIndex + 1)
        ]
      }
    case "REMOVE_TODO":
      const removeIndex = state.todos.findIndex((todo) => todo.text === action.payload);
      return {
        todos: [
          ...state.todos.slice(0, removeIndex),
          ...state.todos.slice(removeIndex + 1)
        ]
      };
    default:
      return state;
  }
}

const store$ = new RxStore(reducer, {todos: []});

store$.subscribe(state => console.log(state.todos.length));
// log: 0
store$.dispatch({ type: "ADD_TODO", payload: {text: "read this example", done: false} });
// log: 1
store$.dispatch({ type: "ADD_TODO", payload: {text: "learn typescript", done: false} });
// log: 2
store$.dispatch({ type: "ADD_TODO", payload: {text: "foobar", done: false} });
// log: 3
store$.dispatch({ type: "ADD_TODO", payload: {text: "learn rxjs", done: false} });
// log: 4
store$.dispatch({ type: "TOGGLE_TODO", payload: "read this example" });
// log: 4
store$.dispatch({ type: "REMOVE_TODO", payload: "foobar" });
// log: 3

console.log(JSON.stringify(store$.state, null, 2));
// log:
// ​​​​​{​​​​​
// ​​​​​  "todos": [​​​​​
// ​​​​​    {​​​​​
// ​​​​​      "text": "read this example",​​​​​
// ​​​​​      "done": true​​​​​
// ​​​​​    },​​​​​
// ​​​​​    {​​​​​
// ​​​​​      "text": "learn typescript",​​​​​
// ​​​​​      "done": false​​​​​
// ​​​​​    },​​​​​
// ​​​​​    {​​​​​
// ​​​​​      "text": "learn rxjs",​​​​​
// ​​​​​      "done": false​​​​​
// ​​​​​    }​​​​​
// ​​​​​  ]​​​​​
// ​​​​​}​​​
```
