const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoConnect = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Conversation = require("./models/Conversation");
const User = require("./models/User");
const Messages = require("./models/Message");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

mongoConnect();

app.get("/", (req, res) => {
  res.send("<h1>Hello Express...!</h1>");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/conversation", conversationRoutes);
app.use("/api/v1/message", messageRoutes);

let users = [];

io.on("connection", (socket) => {
  console.log("User Connected" + socket.id);

  socket.on("addUser", (userId) => {
    const exists = users.find((user) => user.userId === userId);

    console.log("jksndjf");
    if (!exists) {
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit("getUsers", users);

      console.log("skjdjfvbhjbrhjber");
    }
  });

  socket.on(
    "sendMessage",
    async ({ senderId, receiverId, message, conversationId }) => {
      const receiver = users.find((user) => user.userId === receiverId);
      const sender = users.find((user) => user.userId === senderId);
      const user = await User.findById(senderId);

      if (receiver) {
        io.to(receiver.socketId)
          .to(sender.socketId)
          .emit("getMessage", {
            message,
            senderId,
            conversationId,
            receiverId,
            user: { id: user._id, email: user.email, name: user.name },
            time: new Date(),
          });
      }
    }
  );

  socket.on("deleteConversation", ({ senderId, receiverId, message }) => {
    const receiver = users.find((user) => user.userId === receiverId);
    const sender = users.find((user) => user.userId === senderId);

    if (receiver) {
      io.to(receiver.socketId).to(sender.socketId).emit("deleteConversation", {
        senderId,
        receiverId,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);

    console.log("User Disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server is running...");
});
