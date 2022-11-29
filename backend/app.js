require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

app.use(cors());
app.use(bodyParser.json());

const User = require("./model/User");
const Todo = require("./model/Todo");
const port = process.env.PORT || 5000;
const socketio = require("socket.io");
const expressServer = app.listen(port);
const io = socketio(expressServer);
const jwt = require("jsonwebtoken");
const Redis = require("redis");
const redisClient = Redis.createClient();

io.on("connection", async (socket) => {
  //new todo
  socket.on("new-todo", async (result) => {
    await redisClient.connect();
    const token = result.token;
    const todo = result.todo;
    const user = jwt.verify(token, process.env.PRIVATEKEY);
    const userId = user._id;
    const data = `${userId}:${todo}`;
    redisClient.rPush("BACKEND_TASK_ROSHIN", data);
    socket.emit("added-new-todo", { todo });
    const redisTodos = await redisClient.lRange(
      "BACKEND_TASK_ROSHIN",
      "0",
      "-1"
    );
    if (redisTodos.length >= 5) {
      redisTodos.forEach(async (x) => {
        const userTodo = x.split(":");
        const userId = userTodo[0];
        const todo = userTodo[1];
        const newtodo = await Todo.create({
          todo: todo,
          userId: userId,
        });
      });
      await redisClient.flushAll();
    }
    await redisClient.disconnect();
  });
  //get all todos
  socket.on("get-todos", async (token) => {
    await redisClient.connect();
    const user = jwt.verify(token.token, process.env.PRIVATEKEY);
    const userId = user._id;
    const allTodos = await Todo.find({ userId: userId });
    const todosList = allTodos.map((todo) => {
      console.log(todo.todo);
      return todo.todo;
    });
    const redisTodos = await redisClient.lRange(
      "BACKEND_TASK_ROSHIN",
      "0",
      "-1"
    );
    redisTodos.forEach((x) => {
      const userTodo = x.split(":");
      const redisUserId = userTodo[0];
      const redisTodo = userTodo[1];
      if (userId == redisUserId) {
        todosList.push(redisTodo);
      }
    });
    socket.emit("receive-todos", { todosList });
    await redisClient.disconnect();
  });
});

app.post("/", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashPass = await bcrypt.hash(password, 10);
  const newuser = await User.create({ email: email, password: hashPass });
  res.json({ newuser });
});

app.post("/loguser", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  const user = await User.findOne({ email: email });
  //   console.log(user);
  if (!user) {
    res.status(404).json({ msg: "no user found" });
    return;
  }
  const passmatch = await bcrypt.compare(password, user.password);
  if (!passmatch) {
    res.status(404).json({ msg: "passno match" });
    return;
  }
  const token = jwt.sign(JSON.stringify(user), process.env.PRIVATEKEY);
  //   console.log(token);
  res.json({ user, token });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
