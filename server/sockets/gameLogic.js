const lobbyStorage = require("../lobbyStorage/lobbyStorage.js");
const { sendGameState } = require("../utils/sendGameState.js");

module.exports = (socket, io) => {
  socket.on("game", (lobbyID) => {
    const lobby = lobbyStorage.get(lobbyID);
    lobby.countOfReady++;

    if (lobby.countOfReady === lobby.members.length) {
      lobby.gameStarted = true;
      lobby.engine.setRandomPosition();
      lobby.engine.shuffleDeck();
      lobby.engine.dealingCards();
      lobby.engine.checkConditiosOfFirstMove();
      lobby.countOfPlayersCards();
      lobby.resetReadyStatus();

      console.log(lobby.countPlayersCard);

      io.to(lobbyID).emit("setPosition", lobby.playerPosition);
      sendGameState(io, lobby);
    }
  });

  socket.on("playerMove", (data) => {
    const lobby = lobbyStorage.get(data.lobbyID);

    if (
      lobby.engine.setNextMove(
        data.whoMoved,
        data.move,
        data.conditionFor8,
        data.firstMoveCard,
        data.jackSuit
      )
    ) {
      //раунд закінчився
      if (lobby.engine.checkLoseGame()) {
        sendGameState(io, lobby);
        lobby.countOfReady = 0;
        io.to(data.lobbyID).emit("endRaund", {
          board: lobby.board.slice(-4),
          endRaund: true,
          lobbyMembers: lobby.members,
          whoIsMove: "",
          countPlayersCards: lobby.countPlayersCard,
          numberOfRound: lobby.numberOfRound,
          finishGame: true,
          loserList: lobby.nameOfLosers,
        });
      } else {
        sendGameState(io, lobby);
        lobby.countOfReady = 0;
        io.to(data.lobbyID).emit("endRaund", {
          board: lobby.board.slice(-4),
          endRaund: true,
          lobbyMembers: lobby.members,
          whoIsMove: "",
          countPlayersCards: lobby.countPlayersCard,
          numberOfRound: lobby.numberOfRound,
          finishGame: false,
          loserList: lobby.nameOfLosers,
        });
      }
    } else {
      sendGameState(io, lobby);
    }
  });

  socket.on("firstMoveSetJackSuit", (data) => {
    const lobby = lobbyStorage.get(data.lobbyID);

    lobby.engine.setJackSuitFirstMove(lobby.whoIsMove, data.suit);
    io.to(data.lobbyID).emit("updateGameState", {
      whoIsMove: lobby.whoIsMove,
      board: lobby.board.slice(-4),
      countPlayersCards: lobby.countPlayersCard,
    });
  });

  socket.on("getOneCard", (data) => {
    const lobby = lobbyStorage.get(data.lobbyID);
    lobby.engine.giveCard(data.name, 1);
    lobby.countOfPlayersCards();

    io.to(data.lobbyID).emit("updateGameState", {
      whoIsMove: lobby.whoIsMove,
      board: lobby.board.slice(-4),
      countPlayersCards: lobby.countPlayersCard,
    });

    socket.emit("takeOneCard", {
      hand: lobby.engine.sortCards(
        lobby.members[lobby.getPlayerIndex(data.name)].hand
      ),
    });
  });

  socket.on("skipMove", (data) => {
    const lobby = lobbyStorage.get(data.lobbyID);
    lobby.engine.skipMove(data.name);
    lobby.countOfPlayersCards();

    io.to(data.lobbyID).emit("updateGameState", {
      whoIsMove: lobby.whoIsMove,
      board: lobby.board.slice(-4),
      countPlayersCards: lobby.countPlayersCard,
    });
  });

  socket.on("readyToStartNewRound", (data) => {
    const lobby = lobbyStorage.get(data.lobbyID);
    const playerIndex = lobby.members.findIndex(
      (user) => user.socketID == socket.id
    );

    lobby.members[playerIndex].readyStatus = data.readyStatus;

    data.readyStatus ? lobby.countOfReady++ : lobby.countOfReady--;

    socket.to(data.lobbyID).emit("readyToStartNewRuondStatus", lobby.members);

    if (lobby.countOfReady === lobby.members.length) {
      switch (lobby.gameFinished) {
        //start new game
        case true:
          lobby.gameFinished = false;
          lobby.engine.prepearToNewGame();
          lobby.engine.setRandomPosition();
          lobby.engine.shuffleDeck();
          lobby.engine.dealingCards();
          lobby.engine.checkConditiosOfFirstMove();
          lobby.countOfPlayersCards();
          lobby.resetReadyStatus();

          io.to(data.lobbyID).emit("setPosition", lobby.playerPosition);
          io.to(data.lobbyID).emit("roundRestarted", { roundStart: false });
          sendGameState(io, lobby);

          break;

        //start new round
        case false:
          lobby.engine.prepearToNewRound();
          lobby.engine.shuffleDeck();
          lobby.engine.dealingCards();
          lobby.engine.checkConditiosOfFirstMove();
          lobby.countOfPlayersCards();

          lobby.resetReadyStatus();

          io.to(data.lobbyID).emit("roundRestarted", { roundStart: false });

          sendGameState(io, lobby);
          break;
      }
    }
  });

  socket.on("leaveGame", (data) => {
    const lobby = lobbyStorage.get(data.lobbyID);
    lobby.engine.leaveGame(data.name);
    io.to(data.lobbyID).emit("setPosition", lobby.playerPosition);
    sendGameState(io, lobby);
  });
};
