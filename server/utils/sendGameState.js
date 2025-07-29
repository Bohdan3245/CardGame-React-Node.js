function sendGameState(io, lobby) {
  lobby.playerPosition.forEach((e) => {
    const player = lobby.members.find((p) => p.name === e);

    io.to(player.socketID).emit("getCards", {
      hand: lobby.engine.sortCards(player.hand),
      whoIsMove: lobby.whoIsMove,
      board: lobby.board.slice(-4),
      countPlayersCards: lobby.countPlayersCard,
      firstMove: lobby.firstMove,
    });
  });
}

module.exports.sendGameState = sendGameState;
