const { getRoomsList } = require("../sockets/rooms");
const { removeUserFromRoom } = require("../utils/removeUserFromRoom");
const { generateLobbyID } = require("../utils/generateLobbyID.js");
const rooms = getRoomsList();

module.exports = (socket, io) => {
  socket.on("createLobby", (data) => {
    const roomID = generateLobbyID();
    socket.join(roomID);
    socket.roomID = roomID;

    if (!rooms[roomID]) {
      rooms[roomID] = {};
    }

    rooms[roomID].lobbyMembers = [];
    rooms[roomID].countOfReady = 0;
    rooms[roomID].lobbyMembers.push({
      name: data.name,
      socketID: socket.id,
      lobbyID: roomID,
      readyStatus: false,
      points: 0,
      howManyPointsAdd: 0,
      countOfGameLose: 0,
    });
    io.to(roomID).emit("lobbyMembers", rooms[roomID].lobbyMembers);
  });

  socket.on("joinLobby", (data) => {
    console.log("це те шо join", data);

    if (data.roomID in rooms) {
      if (rooms[data.roomID].lobbyMembers.length >= 4) {
        io.to(data.socketID).emit("response", {
          message: "This lobby is full.",
        });
      } else {
        socket.join(data.roomID);
        socket.roomID = data.roomID;

        rooms[data.roomID].lobbyMembers.push({
          name: data.name,
          socketID: socket.id,
          lobbyID: data.roomID,
          readyStatus: false,
          points: 0,
          howManyPointsAdd: 0,
          countOfGameLose: 0,
        });

        io.to(data.socketID).emit("response", {
          message: "ok",
        });

        io.to(data.roomID).emit(
          "lobbyMembers",
          rooms[data.roomID].lobbyMembers
        );
      }
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
    const userIndex = rooms[data.lobbyID].lobbyMembers.findIndex(
      (user) => user.socketID == socket.id
    );

    rooms[data.lobbyID].lobbyMembers[userIndex].readyStatus = data.readyStatus;
    //console.log(rooms[data.lobbyID]);

    socket
      .to(data.lobbyID)
      .emit("lobbyMembers", rooms[data.lobbyID].lobbyMembers);
  });

  socket.on("startGame", (data) => {
    socket.to(data.lobbyID).emit("switchToStartModule", data.command);
  });
};
