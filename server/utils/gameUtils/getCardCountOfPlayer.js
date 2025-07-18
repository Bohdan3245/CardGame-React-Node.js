const { getRoomsList } = require("../../sockets/rooms");
const rooms = getRoomsList();

function getCardCountByName(name, lobbyID) {
  const player = rooms[lobbyID].lobbyMembers.find((p) => p.name === name);
  return player ? player.hand.length : 0;
}

module.exports.getCardCountByName = getCardCountByName;
