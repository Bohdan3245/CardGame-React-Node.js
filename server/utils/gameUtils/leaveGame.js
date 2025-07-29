function leaveGame(lobby, playerName) {
  console.log("той хто хоче себатися ", playerName);
  const playerIndex = lobby.lobbyMembers.findIndex((p) => {
    return p.name === playerName;
  });

  const playerIndexRP = lobby.randomPosition.indexOf(playerName);
  const countCardsIndex = lobby.countPlayersCards.findIndex(
    (p) => p.name === playerName
  );

  //add cards of the player who left to the deck
  lobby.deck.push(...lobby.lobbyMembers[playerIndex].hand);

  if (lobby.whoIsMove === playerName) {
    lobby.whoIsMove =
      lobby.randomPosition[(playerIndexRP + 1) % lobby.randomPosition.length];
  }

  //remove player from lobby
  lobby.lobbyMembers.splice(playerIndex, 1);

  //update countPlayersCards
  lobby.countPlayersCards.splice(countCardsIndex, 1);

  //update RandomPosition

  lobby.randomPosition.splice(playerIndexRP, 1);
}
module.exports.leaveGame = leaveGame;
