const lobbyStorage = require("../lobbyStorage/lobbyStorage");

const { generateLobbyID } = require("./generateLobbyID");
function createUnicueLobbyId() {
  let lobbyID;
  do {
    lobbyID = generateLobbyID();
  } while (lobbyStorage.has(lobbyID));

  return lobbyID;
}

module.exports.createUnicueLobbyId = createUnicueLobbyId;
