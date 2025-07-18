const { getPlayerIndex } = require("./getPlayerIndex");

function checkWinnigRound(lobby, name) {
  const playerIndex = getPlayerIndex(lobby.lobbyMembers, name);
  console.log(
    "КАРТИ ГРАВЦЯ НА ПЕРЕВІРЦІ",
    lobby.lobbyMembers[playerIndex].hand
  );
  if (lobby.board.at(-1).value === "6") {
    return false;
  }
  if (lobby.lobbyMembers[playerIndex].hand.length === 0) {
    console.log(
      "КАРТИ ГРАВЦЯ ЯКИЙ ЗАВЕРШИВ РАУНД",
      lobby.lobbyMembers[playerIndex].hand
    );
    return true;
  }
  return false;
}

module.exports.checkWinnigRound = checkWinnigRound;
