const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");
const DataBase = require("./database.js");
const db = new DataBase();
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
io.on("connection", function (socket) {
  console.log(io.sockets.connected);
  console.log("A user with ID: " + socket.id + " connected");

  socket.on("disconnect", function () {
    console.log("A user with ID: " + socket.id + " disconnected");
  });

  // More Socket listening here.
  // if (io.sockets.connected) console.log(io.sockets.connected);
  // socket.emit("connections", Object.keys(io.sockets.connected).length);

  socket.on("chat-message", async (message) => {
    const data = {
      message: message.message,
      user_id: socket.id,
      name: message.user,
    };
    console.log(data);
    const messageData = await db.storeUserMessage(data);
    socket.broadcast.emit("chat-message", message);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  socket.on("joined", async (name) => {
    let messageData = null;
    const data = {
      name,
      user_id: socket.id,
    };
    const user = await db.addUser(data);
    if (user === "User already exist") {
      messageData = await db.fetchUserMessages(data);
    }
    // console.log(messageData);
    socket.broadcast.emit("joined", messageData);
  });

  socket.on("leave", (data) => {
    socket.broadcast.emit("leave", data);
  });
});
http.listen(3000, () => {
  console.log("Listening on port *: 3000");
});
