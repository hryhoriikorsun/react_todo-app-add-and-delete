/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { deleteTodo, getTodos, postTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { Header } from './components/Header';
import { ErrorNotification } from './components/ErrorNotification';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { StatusTodos } from './types/StatusTodos';

const prepereTodos = (todos: Todo[], statusTodos: StatusTodos) => {
  let preparedTodo = [...todos];

  switch (statusTodos) {
    case StatusTodos.Completed:
      preparedTodo = preparedTodo.filter(todo => todo.completed);
      break;
    case StatusTodos.Active:
      preparedTodo = preparedTodo.filter(todo => !todo.completed);
      break;
  }

  return preparedTodo;
};

export const App: React.FC = () => {
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletedTodoId, setDeletedTodoId] = useState(0);

  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const [inputForAddTodo, setInputForAddTodo] = useState('');

  const [selectStatusTodos, setSelectStatusTodos] = useState(StatusTodos.All);

  const visibleTodos = prepereTodos(todos, selectStatusTodos);

  useEffect(() => {
    setIsLoadingTodos(true);
    setErrorMessage('');

    getTodos()
      .then(setTodos)
      .catch(error => {
        setErrorMessage('Unable to load todos');
        throw error;
      })
      .finally(() => setIsLoadingTodos(false));
  }, []);

  const handleAddTodo = async ({
    title,
    completed,
    userId,
  }: Omit<Todo, 'id'>) => {
    const temp = { id: 0, title, completed, userId };

    setTempTodo(temp);

    try {
      const newTodo = await postTodo({ title, completed, userId });

      setTodos(currentTodos => [...currentTodos, newTodo]);
      setInputForAddTodo('');
    } catch (error) {
      setErrorMessage('Unable to add a todo');
    } finally {
      setTempTodo(null);
    }
  };

  useEffect(() => {
    deleteTodo(deletedTodoId)
      .then(() =>
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== deletedTodoId),
        ),
      )
      .catch(error => {
        if (error instanceof Error) {
          setErrorMessage('Unable to delete a todo');
          throw error;
        }
      });
  }, [deletedTodoId]);

  const handleClearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    completedTodos.map(todo =>
      deleteTodo(todo.id)
        .then(() => {
          setTodos(currentTodos =>
            currentTodos.filter(currTodo => currTodo.id !== todo.id),
          );
        })
        .catch(() => {
          setErrorMessage('Unable to delete a todo');
        }),
    );
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          inputForAddTodo={inputForAddTodo}
          onChangeInput={setInputForAddTodo}
          addTodo={handleAddTodo}
          onErrorMessage={setErrorMessage}
          todosLength={todos.length}
        />

        {/* This is a completed todo */}
        {isLoadingTodos ? (
          'Loading....'
        ) : (
          <TodoList
            visibleTodos={visibleTodos}
            // deleteTodo={handleDeleteTodo}
            deletedTodoId={deletedTodoId}
            changeDeletedTodoId={setDeletedTodoId}
            tempTodo={tempTodo}
          />
        )}

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && !isLoadingTodos && (
          <Footer
            todos={todos}
            selectStatusTodos={selectStatusTodos}
            onChangeStatusTodos={setSelectStatusTodos}
            onClearCompleted={handleClearCompleted}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <ErrorNotification
        errorMessage={errorMessage}
        onErrorMessage={setErrorMessage}
      />
    </div>
  );
};
