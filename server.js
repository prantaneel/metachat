const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
var path = require("path");

app.use(express.static(path.join(__dirname, "./public")));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "./public/index.html");
});

io.on("connection", (socket) => {
  var user;
  console.log("new connection");
  socket.on("joining msg", (username) => {
    user = username;
    io.emit("chat message conn", `---${user} joined the chat---`);
  });
  socket.on("base64 file", function (msg) {
    console.log("received base64 file from server: " + msg);
    //socket.username = msg.username;
    socket.broadcast.emit(
      "base64 image", //exclude sender
      // io.sockets.emit(
      //   "base64 file", //include sender

      msg
    );
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    socket.emit("chat message conn", `---${user} disconnected---`);
  });
  socket.on("chat message", (msg) => {
    socket.broadcast.emit("chat message", msg);
  });
});
server.listen(3000, () => {
  console.log("server listening on port 3000");
});
