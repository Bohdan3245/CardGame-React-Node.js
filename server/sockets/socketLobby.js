const { createUnicueLobbyId } = require("../utils/createUniqueLobbyID.js");
const lobbyStorage = require("../lobbyStorage/lobbyStorage.js");
const Lobby = require("../classes/Lobby.js");

module.exports = (socket, io) => {
  socket.on("createLobby", (data) => {
    const lobbyID = createUnicueLobbyId();
    socket.join(lobbyID);
    //create lobby
    const newLobby = new Lobby(lobbyID);
    //add player to lobby
    newLobby.addPlayer(data.name, socket.id, lobbyID);
    //set lobby admin
    newLobby.lobbyAdmin = data.name;
    //save lobby in lobbyStorage
    lobbyStorage.set(newLobby.lobbyID, newLobby);
    //send list of lobby members
    io.to(lobbyID).emit("lobbyMembers", newLobby.members);
    socket.lobbyID = lobbyID;
    //add lobbyID in socket object for get ID when socket disconnected
    console.log(typeof lobbyID);
    console.log(socket.userName);
  });

  socket.on("joinLobby", (data) => {
    if (!lobbyStorage.has(data.lobbyID)) {
      io.to(socket.id).emit("response", {
        message: "This lobby doesn't exist.",
      });
      return;
    }

    const lobby = lobbyStorage.get(data.lobbyID);
    if (lobby.members.length >= 4) {
      io.to(socket.id).emit("response", {
        message: "This lobby is full.",
      });
    }

    socket.join(data.lobbyID);
    lobby.addPlayer(data.name, socket.id, data.lobbyID);

    io.to(socket.id).emit("response", { message: "ok" });
    io.to(data.lobbyID).emit("lobbyMembers", lobby.members);
    //add lobbyID in socket object for get ID when socket disconnected
    socket.lobbyID = data.lobbyID;
  });

  socket.on("leaveLobby", (data) => {
    const lobby = lobbyStorage.get(data.lobbyID);
    lobby.removePlayer(data.name);

    io.to(data.lobbyID).emit("setLobbyAdmin", lobby.lobbyAdmin);
    socket.to(data.lobbyID).emit("lobbyMembers", lobby.members);
    socket.leave(data.lobbyID);
    //remove lobbyID in socket
    socket.lobbyID = "";
  });

  socket.on("readyToStart", (data) => {
    const lobby = lobbyStorage.get(data.lobbyID);
    const playerIndex = lobby.getPlayerIndex(data.name);
    lobby.members[playerIndex].readyStatus = data.readyStatus;

    socket.to(data.lobbyID).emit("lobbyMembers", lobby.members);
  });

  socket.on("startGame", (data) => {
    socket.to(data.lobbyID).emit("switchToStartModule", data.command);
  });
};
