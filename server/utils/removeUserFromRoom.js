const { getRoomsList } = require("../sockets/rooms");

function removeUserFromRoom(roomID, socketID, io) {
  try {
    const rooms = getRoomsList();

    // Перевірка на існування кімнати перед доступом до її учасників
    if (!rooms[roomID]) return;

    // якщо виходить власник лоббі, власником стає наступний
    const index = rooms[roomID].findIndex((user) => user.socketID === socketID);
    if (index === 0 && rooms[roomID].length > 1) {
      //rooms[roomID][1].lobbyAdmin = true;
      io.to(rooms[roomID][1].socketID).emit("setLobbyAdmin", true);
    }

    // Видаляємо користувача
    rooms[roomID] = rooms[roomID].filter((user) => user.socketID !== socketID);

    if (rooms[roomID].length === 0) {
      delete rooms[roomID];
    } else {
      io.to(roomID).emit("lobbyMembers", rooms[roomID]);
    }
  } catch (err) {
    console.error(`Помилка у removeUserFromRoom: ${err.message}`);
  }
}

module.exports.removeUserFromRoom = removeUserFromRoom;
