function checkLoseGame(lobby) {
  let losersArr = [];
  for (let player of lobby.lobbyMembers) {
    if (player.points > 125) {
      losersArr.push(player.name);
      player.countOfGameLose++;
    }
  }
  lobby.nameOfLosers = losersArr;
  if (losersArr.length > 0) {
    lobby.gameFinished = true;
    return true;
  }
}

module.exports.checkLoseGame = checkLoseGame;
