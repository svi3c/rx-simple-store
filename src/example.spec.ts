import { RxStore } from "./store";

interface Todo {
  text: string;
  done: boolean;
}

interface State {
  todos: Todo[];
}

class TodoStore extends RxStore<State> {
  // This action is not mutating the state
  addTodo(todo: Todo) {
    this.publish({
      todos: [...this.state.todos, todo],
    });
  }

  // This action is mutating the state
  updateTodo(idx: number, todo: Partial<Todo>) {
    const todos = this.state.todos;
    this.publish({
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

describe("Example", () => {
  it("should result in the correct state", () => {
    expect(todoStore.state).toMatchSnapshot();
  });
});
