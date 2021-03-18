const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((ckeckUser) => ckeckUser.username === username);

  if(!user) {
    return response.status(404).json({ error: 'Username not found.' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const checkUsernameExists = users.find((user) => user.username === username);

  if(checkUsernameExists) {
    return response.status(400).json({ error: 'Username already exists.' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((oldTodo) => oldTodo.id === id);

  if(!todo) {
    return response.status(404).json({ error: 'Todo not found.' });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((doneTodo) => doneTodo.id === id);

  if(!todo) {
    return response.status(404).json({ error: "Todo not found." });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((deletedTodo) => deletedTodo.id === id);

  if(!todo) {
    return response.status(404).json({ error: "Todo not found." });
  }

  //user.todos = user.todos.filter((deletedTodo) => deletedTodo.id !== id);

  user.todos.splice(user.todos.id, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
