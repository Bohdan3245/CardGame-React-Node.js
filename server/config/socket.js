const User = require("../models/user");
let ioInstance;

//Map() де ключ це ім'я, а socketID значення
let onlineUserByName = new Map();
//Map() де ключ це socketID, а ім'я значення
let onlineUserBySocketID = new Map();

async function sendMyStatusToFriends(io, myName, mySocketID, status) {
  try {
    const myData = await User.findOne({ username: myName });
    const friendList = myData.friendList;
    let arr = [];
    if (friendList !== null)
      for (const name of friendList) {
        if (onlineUserByName.get(name)) {
          arr.push({
            friendName: name,
            socketID: onlineUserByName.get(name),
            onlineStatus: status,
          });
          io.to(onlineUserByName.get(name)).emit("onlineStatusOfFriend", {
            friendName: myName,
            socketID: mySocketID,
            onlineStatus: status,
          });
        }
      }
    //відправляє список друзів онлайн на мій акк, коли я авторизуюсь
    io.to(mySocketID).emit("myOnlineFriendList", arr);
  } catch (err) {
    console.error("Помилка при надсиланні статусу друзям:", err.message);
  }
}

module.exports = (io) => {
  ioInstance = io;

  //У io.on("connection", ...) — реєструєш всі події юзера через сокет.
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    // console.log(socket.handshake.headers);

    socket.on("disconnect", async () => {
      ////////////// deleting Map() (Online Friends List) //////////////
      const nameKey = onlineUserBySocketID.get(socket.id);

      //надсилання всім друзям мій статус оффлайн коли я вихожу
      sendMyStatusToFriends(
        ioInstance,
        onlineUserBySocketID.get(socket.id),
        onlineUserByName.get(nameKey),
        false
      );

      if (nameKey) {
        onlineUserByName.delete(nameKey);
        onlineUserBySocketID.delete(socket.id);
      }

      // console.log("Мапа після видалення де ключ це ім'я: ", onlineUserByName);
      // console.log(
      //   "Мапа після видалення де ключ це socketID: ",
      //   onlineUserBySocketID
      // );

      ////////////////////////////////////////////////////////////////////////

      //Видалення socket.id в базі даних (скоріш за все приберу це коли зрозумію чи треба мені цей айді в бд чи ні)
      await User.updateOne({ socketID: socket.id }, { $set: { socketID: "" } });
      console.log("User disconnect:", socket.id);
    });

    //вся логіка
    ////////////// add Map() (Online Friends List) //////////////
    socket.on("socketLogin", (data) => {
      onlineUserByName.set(data.name, data.socketID);
      onlineUserBySocketID.set(data.socketID, data.name);

      // console.log("Мапа де ключ це ім'я: ", onlineUserByName);
      // console.log("Мапа де ключ це socketID: ", onlineUserBySocketID);

      //відправити всім друзям шо я онлайн
      sendMyStatusToFriends(
        ioInstance,
        onlineUserBySocketID.get(data.socketID),
        onlineUserByName.get(data.name),
        true
      );
    });

    //////////////////////////////////////////////////////////////

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

const getSocketIDofOnlineUsersByName = () => {
  return onlineUserByName;
};
// Функція для використання io в інших модулях

module.exports.getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initiallizated.");
  }
  return ioInstance;
};

//експортую список socketID які зараз онлайн
module.exports.getSocketIDofOnlineUsersByName = getSocketIDofOnlineUsersByName;
