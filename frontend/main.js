const socket = io("http://localhost:5000/", {
  transports: ["websocket"],
});

const token = localStorage.getItem("token");
const todoForm = document.getElementById("todo-form");
const todoBtn = document.getElementById("addTodo");

window.addEventListener("DOMContentLoaded", () => {
  fetchAll();
});
async function fetchAll() {
  document.getElementById("todos").innerHTML = "";
  socket.emit("get-todos", { token });
  socket.on("receive-todos", (result) => {
    document.getElementById("todos").innerHTML = "";
    const allTodos = result.todosList;
    allTodos.forEach((todo) => {
      addToList(todo);
    });
  });
}

//disconnect socket io and client disconnect
// socket.on("disconnect", async () => {
//   console.log("disconnect==>", socket.connected);
//   console.log("disconnct", socket.id);
// });

// socket.on("connect", async () => {
//   console.log("socket id--->", socket.id);
//   console.log("connect==>", socket.connected);
// });

todoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const newtodo = document.getElementById("newtodo");
  const todo = newtodo.value;
  newtodo.value = "";
  socket.emit("new-todo", { todo, token });
  socket.on("added-new-todo", (result) => {
    console.log(result);
  });
  addToList(todo);
});

function addToList(todo) {
  const todos = document.getElementById("todos");
  const newTodoELement = document.createElement("li");
  newTodoELement.classList = "todos-item";
  newTodoELement.innerText = `${todo}`;
  todos.appendChild(newTodoELement);
}
