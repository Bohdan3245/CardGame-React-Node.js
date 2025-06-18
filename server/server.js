require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const port = process.env.PORT;
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

//ініціалізація socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // дозволити доступ з будь-якого джерела (для розробки)
  },
});

require("./config/socket")(io); //Підключаємо логіку сокетів

connectDB(); // підключення DB

// Middleware для парсингу JSON та дозволу CORS
app.use(express.json()); //дозволяє приймати запити формату json
app.use(express.text()); //дозволяє приймати запити формату text
app.use(cors()); // дозволяє приймати запити з React

//імпорт маршрутів
const authRouters = require("./routers/auth");
app.use("/api/auth", authRouters);

const friendsRouters = require("./routers/friends");
app.use("/api/friends", friendsRouters);

// запуск сервера
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
