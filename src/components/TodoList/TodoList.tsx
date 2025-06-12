import React from 'react';
import { Todo as TodoInterface } from '../../types/Todo';
import { Todo } from '../Todo/Todo';

interface TodoListProps {
  visibleTodos: TodoInterface[];
  // deleteTodo: (userId: number) => void;
  deletedTodoId: number;
  changeDeletedTodoId: (deletedTodo: number) => void;
  tempTodo: TodoInterface | null;
}

export const TodoList: React.FC<TodoListProps> = ({
  visibleTodos,
  deletedTodoId,
  changeDeletedTodoId,
  tempTodo,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {visibleTodos?.map(todo => {
        return (
          <Todo
            key={todo.id}
            todo={todo}
            deletedTodoId={deletedTodoId}
            changeDeletedTodoId={changeDeletedTodoId}
          />
        );
      })}
      {tempTodo && (
        <Todo
          key="temp"
          todo={tempTodo}
          deletedTodoId={deletedTodoId}
          changeDeletedTodoId={changeDeletedTodoId}
        />
      )}
    </section>
  );
};
