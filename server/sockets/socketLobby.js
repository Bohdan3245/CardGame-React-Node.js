const { getRoomsList } = require("../sockets/rooms");
const { removeUserFromRoom } = require("../utils/removeUserFromRoom");
const { generateLobbyID } = require("../utils/generateLobbyID");
const rooms = getRoomsList();

module.exports = (socket, io) => {
  socket.on("createLobby", (data) => {
    const roomID = generateLobbyID();
    socket.join(roomID);
    socket.roomID = roomID;

    if (!rooms[roomID]) {
      rooms[roomID] = [];
    }

    rooms[roomID].push({
      name: data.name,
      socketID: socket.id,
      lobbyID: roomID,
      readyStatus: false,
    });
    io.to(roomID).emit("lobbyMembers", rooms[roomID]);
  });

  socket.on("joinLobby", (data) => {
    console.log("це те шо join", data);

    if (data.roomID in rooms) {
      socket.join(data.roomID);
      socket.roomID = data.roomID;

      rooms[data.roomID].push({
        name: data.name,
        socketID: socket.id,
        lobbyID: data.roomID,
        readyStatus: false,
      });

      io.to(data.socketID).emit("response", {
        message: "ok",
      });

      io.to(data.roomID).emit("lobbyMembers", rooms[data.roomID]);
    } else {
      io.to(data.socketID).emit("response", {
        message: "This lobby doesn't exist.",
      });
    }
  });

  socket.on("leaveLobby", (roomID) => {
    removeUserFromRoom(roomID, socket.id, io);
    socket.leave(roomID);
    //console.log("юзер лівнув з кімнати", socket.id);
    //console.log(rooms);
  });

  socket.on("readyToStart", (data) => {
    const userIndex = rooms[data.lobbyID].findIndex(
      (user) => user.socketID == socket.id
    );

    rooms[data.lobbyID][userIndex].readyStatus = data.readyStatus;
    //console.log(rooms[data.lobbyID]);

    socket.to(data.lobbyID).emit("lobbyMembers", rooms[data.lobbyID]);
  });
};
