const user = require("../models/user");
const User = require("../models/user");
let ioInstance;

module.exports = (io) => {
  ioInstance = io;

  //У io.on("connection", ...) — реєструєш всі події юзера через сокет.
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", async () => {
      await User.updateOne({ socketID: socket.id }, { $set: { socketID: "" } });
      console.log("User disconnect:", socket.id);
    });

    //вся логіка
    socket.on("checkFriendRequest", async ({ username }) => {
      try {
        const user = await User.findOne({ username });

        if (!user) {
          return socket.emit("friendRequestList", { friendRequest: [] });
        }

        socket.emit("friendRequestList", {
          friendRequest: user.friendRequest || [],
        });
      } catch (err) {
        console.error("Помилка при перевірці запитів у друзі:", err);
        socket.emit("friendRequestList", { friendRequest: [] });
      }
    });
  });

  //зміна бд в режимі реального часу
  const changeStream = User.watch();

  changeStream.on("change", async (change) => {
    if (change.operationType === "update") {
      const updatedFields = change.updateDescription.updatedFields;

      // 1. Якщо масив friendRequest повністю оновлено
      const isFullUpdate = updatedFields?.friendRequest !== undefined;
      // 2. Якщо в масив friendRequest було додано/змінено елемент
      const isArrayElementChanged = Object.keys(updatedFields || {}).some(
        (key) => key.startsWith("friendRequest.")
      );

      if (isFullUpdate || isArrayElementChanged) {
        const userId = change.documentKey._id;

        try {
          const user = await User.findById(userId);
          if (!user) return;

          io.emit("friendRequestUpdated", {
            username: user.username,
            friendRequest: user.friendRequest,
          });
          // console.log(
          //   `User "\x1b[36m${user.username}\x1b[0m" has new friend request.`
          // );
        } catch (err) {
          console.error(
            "Помилка при відправці оновлення через ChangeStream:",
            err
          );
        }
      }
    }
  });
};

// Функція для використання io в інших модулях

module.exports.getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initiallizated.");
  }
  return ioInstance;
};
