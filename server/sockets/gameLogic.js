const { getRoomsList } = require("../sockets/rooms");
const { randomPosition } = require("../utils/gameUtils/randomPosition");
const { createDeck } = require("../utils/gameUtils/createDeck");
const { shuffleDeck } = require("../utils/gameUtils/shuffleDeck");
const { dealingCards } = require("../utils/gameUtils/dealingCards");
const {
  getCardCountByName,
} = require("../utils/gameUtils/getCardCountOfPlayer");
const { nextMove } = require("../utils/gameUtils/nextMove");
const { getCardFromDeck } = require("../utils/gameUtils/getCardFromDeck");
const { getPlayerIndex } = require("../utils/gameUtils/getPlayerIndex");
const { checkWinnigRound } = require("../utils/gameUtils/checkWinningRound");
const {
  checkCountOfPlayerCards,
} = require("../utils/gameUtils/checkCountOfPlayersCards");
const sizeof = require("object-sizeof");
const { nextPlayerMove } = require("../utils/gameUtils/nextPlayerMove");
const { sumCardsPoint } = require("../utils/gameUtils/sumCardsPoint");
const {
  nextPlayerForNewRound,
} = require("../utils/gameUtils/nextPlayerForNewRound");
const { checkLoseGame } = require("../utils/gameUtils/checkLoseGame");

const rooms = getRoomsList();

module.exports = (socket, io) => {
  socket.on("game", () => {
    rooms[socket.roomID].countOfReady++;

    if (
      rooms[socket.roomID].countOfReady ===
      rooms[socket.roomID].lobbyMembers.length
    ) {
      rooms[socket.roomID].numberOfRound = 1;
      rooms[socket.roomID].gameFinished = false;
      randomPosition(socket.roomID);
      deck = createDeck();
      deck = shuffleDeck(deck);
      //rooms[socket.roomID].deck = shuffleDeck();

      rooms[socket.roomID] = dealingCards(rooms[socket.roomID], deck, socket);
      console.log("########### після роздачі карт ##############");
      console.log(rooms[socket.roomID].lobbyMembers[0].hand);
      console.log(rooms[socket.roomID].lobbyMembers[1].hand);
      // for (let i = 0; i < rooms[socket.roomID].randomPosition.length; i++) {
      //   const count = getCardCountByName(
      //     rooms[socket.roomID].randomPosition[i],
      //     socket.roomID
      //   );
      //   console.log(
      //     `у юзера ${
      //       rooms[socket.roomID].randomPosition[i]
      //     } зараз на руках ${count} карт`
      //   );
      // }

      io.to(socket.roomID).emit(
        "setPosition",
        rooms[socket.roomID].randomPosition
      );

      rooms[socket.roomID].randomPosition.forEach((e) => {
        const player = rooms[socket.roomID].lobbyMembers.find(
          (p) => p.name === e
        );

        io.to(player.socketID).emit("getCards", {
          hand: player.hand,
          whoIsMove: rooms[socket.roomID].whoIsMove,
          board: rooms[socket.roomID].board,
          countPlayersCards: rooms[socket.roomID].countPlayersCards,
          firstMove: rooms[socket.roomID].firstMove,
        });
      });

      // console.log(
      //   "чи додалась рандлм позиція: ",
      //   rooms[socket.roomID].lobbyMembers[0].hand
      // );
      // console.log(
      //   "чи додалась рандлм позиція: ",
      //   rooms[socket.roomID].lobbyMembers[1].hand
      // );
      // console.log(
      //   "чи додалась рандлм позиція: ",
      //   rooms[socket.roomID].lobbyMembers[2].hand
      // );

      // console.log(
      //   "чи додалась рандлм позиція: ",
      //   rooms[socket.roomID].lobbyMembers[3].hand
      // );

      // console.log(rooms[socket.roomID].lobbyMembers);
      // console.log(rooms[socket.roomID].randomPosition);
      // console.log("Хто ходить: ", rooms[socket.roomID].whoIsMove);

      //io.to(socket.roomID).emit("begining", "Гра почалась");
    }

    //console.log(socket.id, index);
    //console.log(`user ${rooms[data][index].name} have index ${index} in lobby`);

    // console.log("CHECKING: ", rooms[socket.roomID].lobbyMembers);
    // console.log(rooms[socket.roomID].countOfReady);
  });

  socket.on("playerMove", (data) => {
    const LID = socket.roomID;
    nextMove(
      LID,
      data.move[0].value,
      data.move,
      data.move.length,
      data.whoMoved,
      socket,
      data.conditionFor8,
      data.firstMoveCard,
      data.jackSuit
    );

    console.log("чим походив NextMove()", data.move);
    // console.log(rooms[LID]);
    //перевірка на кінець раунду
    if (checkWinnigRound(rooms[LID], data.whoMoved)) {
      //підрахунок поінтів в кінці гри
      sumCardsPoint(rooms[LID], data.whoMoved, data.move);

      //readyStatus всіх гравців ставить на false
      for (player of rooms[LID].lobbyMembers) {
        player.readyStatus = false;
      }
      // обнулити кільскість готових гравців
      rooms[LID].countOfReady = 0;

      rooms[LID].countPlayersCards = checkCountOfPlayerCards(
        rooms[LID].lobbyMembers
      );

      if (checkLoseGame(rooms[LID])) {
        io.to(LID).emit("endRaund", {
          board: rooms[LID].board.slice(-4),
          endRaund: true,
          lobbyMembers: rooms[LID].lobbyMembers,
          whoIsMove: "",
          countPlayersCards: rooms[LID].countPlayersCards,
          numberOfRound: rooms[LID].numberOfRound,
          finishGame: true,
          loserList: rooms[LID].nameOfLosers,
        });
      } else {
        io.to(LID).emit("endRaund", {
          board: rooms[LID].board.slice(-4),
          endRaund: true,
          lobbyMembers: rooms[LID].lobbyMembers,
          whoIsMove: "",
          countPlayersCards: rooms[LID].countPlayersCards,
          numberOfRound: rooms[LID].numberOfRound,
          finishGame: false,
          loserList: rooms[LID].nameOfLosers,
        });
      }
    } else {
      console.log(
        "КАРТИ ПЕРШОГО ГРАВЦЯ НА МОМЕНТ НАСТУПНОГО ХОДА",
        rooms[LID].lobbyMembers[0].hand
      );
      console.log(
        "КАРТИ ДРУГОГО ГРАВЦЯ НА МОМЕНТ НАСТУПНОГО ХОДА",
        rooms[LID].lobbyMembers[1].hand
      );
      io.to(LID).emit("updateGameState", {
        whoIsMove: rooms[LID].whoIsMove,
        board: rooms[LID].board.slice(-4),
        countPlayersCards: rooms[LID].countPlayersCards,
      });
    }
  });

  socket.on("firstMoveSetJackSuit", (data) => {
    const LID = data.lobbyID;
    const updateBoard = rooms[data.lobbyID].board.map((card) => ({
      ...card,
      suit: data.suit,
    }));
    rooms[LID].board = [...updateBoard];

    rooms[LID].whoIsMove = nextPlayerMove(
      rooms[LID].randomPosition,
      rooms[LID].whoIsMove
    );

    io.to(LID).emit("updateGameState", {
      whoIsMove: rooms[LID].whoIsMove,
      board: rooms[LID].board.slice(-4),
      countPlayersCards: rooms[LID].countPlayersCards,
    });
  });

  socket.on("getOneCard", (data) => {
    const LID = socket.roomID;
    getCardFromDeck(rooms[LID], rooms[LID].deck, data.name, 1);
    rooms[LID].countPlayersCards = checkCountOfPlayerCards(
      rooms[LID].lobbyMembers
    );
    io.to(LID).emit("updateGameState", {
      whoIsMove: rooms[LID].whoIsMove,
      board: rooms[LID].board.slice(-4),
      countPlayersCards: rooms[LID].countPlayersCards,
    });
    socket.emit("takeOneCard", {
      hand: rooms[LID].lobbyMembers[
        getPlayerIndex(rooms[LID].lobbyMembers, data.name)
      ].hand,
    });
  });

  socket.on("skipMove", (data) => {
    let index = rooms[data.lobbyID].randomPosition.indexOf(
      rooms[data.lobbyID].whoIsMove
    );
    if (index === rooms[data.lobbyID].randomPosition.length - 1) {
      rooms[data.lobbyID].whoIsMove = rooms[data.lobbyID].randomPosition[0];
    } else {
      rooms[data.lobbyID].whoIsMove =
        rooms[data.lobbyID].randomPosition[index + 1];
    }

    rooms[data.lobbyID].countPlayersCards = checkCountOfPlayerCards(
      rooms[data.lobbyID].lobbyMembers
    );

    io.to(data.lobbyID).emit("updateGameState", {
      whoIsMove: rooms[data.lobbyID].whoIsMove,
      board: rooms[data.lobbyID].board.slice(-4),
      countPlayersCards: rooms[data.lobbyID].countPlayersCards,
    });
  });

  socket.on("readyToStartNewRound", (data) => {
    const userIndex = rooms[data.lobbyID].lobbyMembers.findIndex(
      (user) => user.socketID == socket.id
    );

    rooms[data.lobbyID].lobbyMembers[userIndex].readyStatus = data.readyStatus;
    //console.log(rooms[data.lobbyID]);
    if (data.readyStatus) {
      rooms[data.lobbyID].countOfReady++;
      console.log("каунт оф реди приплюсовався");
    } else {
      rooms[data.lobbyID].countOfReady--;
      console.log("каунт оф реди відмінусовався");
      console.log(rooms[data.lobbyID].countOfReady);
    }

    socket
      .to(data.lobbyID)
      .emit("readyToStartNewRuondStatus", rooms[data.lobbyID].lobbyMembers);
    //якшо всі готові, починається некст раунд
    if (
      rooms[data.lobbyID].countOfReady ===
      rooms[data.lobbyID].lobbyMembers.length
    ) {
      //початок нової гри
      if (rooms[data.lobbyID].gameFinished) {
        rooms[data.lobbyID].numberOfRound = 0;
        rooms[data.lobbyID].firstMove = "";

        for (let player of rooms[data.lobbyID].lobbyMembers) {
          player.points = 0;
          player.howManyPointsAdd = "";
        }

        randomPosition(data.lobbyID);
        let deck = createDeck();
        deck = shuffleDeck(deck);
        //rooms[socket.roomID].deck = shuffleDeck();

        rooms[data.lobbyID] = dealingCards(rooms[data.lobbyID], deck, socket);

        io.to(data.lobbyID).emit(
          "setPosition",
          rooms[data.lobbyID].randomPosition
        );

        rooms[data.lobbyID].randomPosition.forEach((e) => {
          const player = rooms[data.lobbyID].lobbyMembers.find(
            (p) => p.name === e
          );

          io.to(player.socketID).emit("getCards", {
            hand: player.hand,
            whoIsMove: rooms[socket.roomID].whoIsMove,
            board: rooms[socket.roomID].board,
            countPlayersCards: rooms[socket.roomID].countPlayersCards,
            firstMove: rooms[socket.roomID].firstMove,
          });
        });

        rooms[data.lobbyID].gameFinished = false;
      } //початок наступного раунда
      else {
      }
      rooms[data.lobbyID].numberOfRound++;
      rooms[data.lobbyID].firstMove = "";

      //whoIsMove виставляємо на того у кого більше за всіх поінтів
      const maxPointsPlayerName = nextPlayerForNewRound(
        rooms[data.lobbyID].lobbyMembers
      );
      const maxPointsPlayerIndex =
        rooms[data.lobbyID].randomPosition.indexOf(maxPointsPlayerName);

      rooms[data.lobbyID].whoIsMove =
        rooms[data.lobbyID].randomPosition[maxPointsPlayerIndex];
      //обнуляєм карти на руках кожного гравця
      for (player of rooms[data.lobbyID].lobbyMembers) {
        player.hand = [];
      }
      rooms[data.lobbyID].board = [];
      rooms[data.lobbyID].deck = [];

      let deck = createDeck();
      deck = shuffleDeck(deck);
      rooms[data.lobbyID] = dealingCards(rooms[data.lobbyID], deck, socket);

      //

      console.log("Виповнилась відправка для початку раунда");
      io.to(data.lobbyID).emit("roundRestarted", { roundStart: false });

      //відправка карт гравцям
      rooms[data.lobbyID].randomPosition.forEach((e) => {
        const player = rooms[data.lobbyID].lobbyMembers.find(
          (p) => p.name === e
        );
        rooms[data.lobbyID].countPlayersCards = checkCountOfPlayerCards(
          rooms[data.lobbyID].lobbyMembers
        );

        io.to(player.socketID).emit("getCards", {
          hand: player.hand,
          whoIsMove: rooms[data.lobbyID].whoIsMove,
          board: rooms[data.lobbyID].board,
          countPlayersCards: rooms[data.lobbyID].countPlayersCards,
          firstMove: rooms[socket.roomID].firstMove,
        });
      });
    }
  });
};
