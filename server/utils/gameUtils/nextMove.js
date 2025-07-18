const { getRoomsList } = require("../../sockets/rooms");
const { nextPlayerMove } = require("./nextPlayerMove");
const {
  removeCardsAfterMoveFromHand,
} = require("./removeCardsAfterMoveFromHand");
const { checkCountOfPlayerCards } = require("./checkCountOfPlayersCards");
const { getCardFromDeck } = require("./getCardFromDeck");
const { getPlayerIndex } = require("./getPlayerIndex");
const { randomPosition } = require("./randomPosition");
const rooms = getRoomsList();

function nextMove(
  lobbyID,
  value,
  cards,
  countOfCard,
  whoseMove,
  socket,
  conditionFor8,
  firstMoveCard,
  jackSuit
) {
  //let cardsArr = cards; // це для того шоб коли прийде накрита 6 якимось іншими картами, передати в потрібний case тіки ці карти без шестірок
  //перевірка, якшо з 6 прийшла ще якась карта, то одразу буде виконуватись case карти яка накрила 6.
  // Якшо 6 прийша не накритою, то відбудеться case "6"
  const lobby = rooms[lobbyID];
  let board = lobby.board;

  if (value === "6") {
    let cardOverSix = cards.filter((c) => c.value !== "6");
    cardOverSix.length == 0
      ? (value = "6")
      : ((value = cardOverSix[0].value),
        (board = [...board, ...cards.filter((c) => c.value === "6")]),
        removeCardsAfterMoveFromHand(
          lobby.lobbyMembers,
          whoseMove,
          cards.filter((c) => c.value === "6")
        ),
        (cards = cardOverSix));
    // console.log("Перевіряю якусь хуєту", cards);
  }

  //Індекс того хто походив в randomPosition
  const indexWhoMoveRP = lobby.randomPosition.indexOf(whoseMove);
  // console.log("indexWhoMoveRP ", indexWhoMoveRP);

  //Індекс того хто походив в lobbyMembers
  const indexWhoMoveLM = lobby.lobbyMembers.findIndex(
    (p) => p.name === whoseMove
  );

  //ім'я наступного гравця від того хто походив в randomPosition
  const nextPlayerNameRP =
    lobby.randomPosition[(indexWhoMoveRP + 1) % lobby.randomPosition.length];
  // console.log("##################nextPlayerNameRP: ", nextPlayerNameRP);

  //індекс наступного гравця від того хто походив в randomPosition
  const nextPlayerIndexRP = lobby.randomPosition.indexOf(nextPlayerNameRP);
  // console.log("##################nextPlayerIndexRP: ", nextPlayerIndexRP);

  //індекс наступного гравця від того хто походив в lobbyMembers
  const nextPlayerIndexLM = lobby.lobbyMembers.findIndex(
    (p) =>
      p.name ===
      lobby.randomPosition[(indexWhoMoveRP + 1) % lobby.randomPosition.length]
  );

  switch (value) {
    case "6":
      if (cards.at(-1).value === "6") {
        lobby.whoIsMove = whoseMove;
        const board = lobby.board;
        lobby.board = [...board, ...cards];
        removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);
        lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
      }
      break;

    case "7":
      let positionIndex = lobby.randomPosition.indexOf(whoseMove);
      if (positionIndex == lobby.randomPosition.length - 1) {
        getCardFromDeck(
          lobby,
          lobby.deck,
          lobby.randomPosition[0],
          cards.length
        );
        const playerIndex = getPlayerIndex(
          lobby.lobbyMembers,
          lobby.randomPosition[0]
        );
        socket
          .to(lobby.lobbyMembers[playerIndex].socketID)
          .emit("getCardsFromPlayer", {
            hand: lobby.lobbyMembers[playerIndex].hand,
          });
      } else {
        getCardFromDeck(
          lobby,
          lobby.deck,
          lobby.randomPosition[positionIndex + 1],
          cards.length
        );

        const playerIndex = getPlayerIndex(
          lobby.lobbyMembers,
          lobby.randomPosition[positionIndex + 1]
        );
        socket
          .to(lobby.lobbyMembers[playerIndex].socketID)
          .emit("getCardsFromPlayer", {
            hand: lobby.lobbyMembers[playerIndex].hand,
          });
      }
      lobby.whoIsMove = nextPlayerMove(lobby.randomPosition, whoseMove);
      lobby.board = [...board, ...cards];
      removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);
      lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
      break;

    case "8":
      if (firstMoveCard === "8") {
        //якшо це перший хід гри і випала 8
        if (!conditionFor8) {
          //якшо всі вибрані вісімки дати наступному гравцю
          let count8cards = cards.length;
          getCardFromDeck(
            lobby,
            lobby.deck,
            lobby.randomPosition[
              (indexWhoMoveRP + 1) % lobby.randomPosition.length
            ],
            count8cards * 2
          );

          socket
            .to(lobby.lobbyMembers[nextPlayerIndexLM].socketID)
            .emit("getCardsFromPlayer", {
              hand: lobby.lobbyMembers[nextPlayerIndexLM].hand,
            });

          lobby.whoIsMove =
            lobby.randomPosition[
              (indexWhoMoveRP + 2) % lobby.randomPosition.length
            ];
          lobby.board = [...board, ...cards];
          removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);

          lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
        } else {
          //якшо інші вісімки гравець хоче розкинути по всім гравцям(на скільки хватить вісімок) окрім наступного гравця так як йому вже при роздачі видало потрібну кількість карт
          let skipOnce = true;
          let countOf8 = cards.length;
          let lastplayer = "";
          for (let i = 1; i <= countOf8; i++) {
            const index = (indexWhoMoveRP + i) % lobby.randomPosition.length;
            const player = lobby.randomPosition[index];
            if (player === whoseMove) {
              countOf8++;
              continue;
            }

            if (
              player === lobby.randomPosition[nextPlayerIndexRP] &&
              skipOnce
            ) {
              countOf8++;
              skipOnce = false;
              continue;
            }

            getCardFromDeck(lobby, lobby.deck, player, 2);
            lastplayer = player;
          }

          lobby.whoIsMove =
            lobby.randomPosition[
              (lobby.randomPosition.indexOf(lastplayer) + 1) %
                lobby.randomPosition.length
            ];

          lobby.board = [...board, ...cards];
          removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);

          lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
          //////////////////////////////////////////////
        }
      } else {
        //якшо це не перший хід
        if (!conditionFor8) {
          getCardFromDeck(
            lobby,
            lobby.deck,
            lobby.randomPosition[
              (indexWhoMoveRP + 1) % lobby.randomPosition.length
            ],
            cards.length * 2
          );

          socket
            .to(lobby.lobbyMembers[nextPlayerIndexLM].socketID)
            .emit("getCardsFromPlayer", {
              hand: lobby.lobbyMembers[nextPlayerIndexLM].hand,
            });

          lobby.whoIsMove =
            lobby.randomPosition[
              (indexWhoMoveRP + 2) % lobby.randomPosition.length
            ];
          lobby.board = [...board, ...cards];

          removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);
          lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
        } else {
          let quantityOfEight = cards.length;
          let nextMovePlayer = "";
          for (let i = 1; i <= quantityOfEight; i++) {
            const index = (indexWhoMoveRP + i) % lobby.lobbyMembers.length;
            const player = lobby.randomPosition[index];
            if (player === whoseMove) {
              quantityOfEight++;
              continue;
            }
            getCardFromDeck(lobby, lobby.deck, lobby.randomPosition[index], 2);
            nextMovePlayer = player;
          }

          //пропускають всі кому випала 8 скіпаючи гравця який походив вісьмірками
          lobby.whoIsMove =
            lobby.randomPosition[
              (lobby.randomPosition.indexOf(nextMovePlayer) + 1) %
                lobby.randomPosition.length
            ];

          lobby.board = [...board, ...cards];
          removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);

          lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);

          for (let i = 0; i < lobby.randomPosition.length; i++) {
            const plIndex = lobby.lobbyMembers.findIndex(
              (p) => p.name === lobby.randomPosition[i]
            );
            socket
              .to(lobby.lobbyMembers[plIndex].socketID)
              .emit("getCardsFromPlayer", {
                hand: lobby.lobbyMembers[plIndex].hand,
              });
          }
        }
      }

      break;

    case "Q":
      if (cards.at(-1).suit === "♠") {
        getCardFromDeck(lobby, lobby.deck, nextPlayerNameRP, 5);
        socket
          .to(lobby.lobbyMembers[nextPlayerIndexLM].socketID)
          .emit("getCardsFromPlayer", {
            hand: lobby.lobbyMembers[nextPlayerIndexLM].hand,
          });

        lobby.whoIsMove =
          lobby.randomPosition[
            (indexWhoMoveRP + 2) % lobby.randomPosition.length
          ];

        lobby.board = [...board, ...cards];
        removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);
        lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
      } else {
        lobby.whoIsMove = nextPlayerMove(lobby.randomPosition, whoseMove);
        lobby.board = [...board, ...cards];
        removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);
        lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
      }
      break;

    case "A":
      if (firstMoveCard === "A") {
        let skipOnce = true;
        let countOfCards = cards.length;
        let lastplayer = "";
        for (let i = 1; i <= countOfCards; i++) {
          const index = (indexWhoMoveRP + i) % lobby.randomPosition.length;
          const player = lobby.randomPosition[index];
          if (player === whoseMove) {
            countOfCards++;
            continue;
          }

          if (player === lobby.randomPosition[nextPlayerIndexRP] && skipOnce) {
            countOfCards++;
            skipOnce = false;
            continue;
          }
          lastplayer = player;
        }
        lobby.whoIsMove =
          lobby.randomPosition[
            (lobby.randomPosition.indexOf(lastplayer) + 1) %
              lobby.randomPosition.length
          ];

        lobby.board = [...board, ...cards];
        removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);
        lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
        // console.log("ВИПОВНИЛАСЬ ІФКА ПЕРШОГО ХОДА ТУЗА");
      } else {
        let countOfCards = cards.length;
        let lastplayer = "";
        for (let i = 1; i <= countOfCards; i++) {
          const index = (indexWhoMoveRP + i) % lobby.randomPosition.length;
          const player = lobby.randomPosition[index];
          if (player === whoseMove) {
            countOfCards++;
            continue;
          }
          lastplayer = player;
        }
        lobby.whoIsMove =
          lobby.randomPosition[
            (lobby.randomPosition.indexOf(lastplayer) + 1) %
              lobby.randomPosition.length
          ];

        lobby.board = [...board, ...cards];
        removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);
        lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
        // console.log("ВИПОВНИЛАСЬ ІФКА ЗВИЧАЙНОГО ХОДА ТУЗА");
      }
      break;

    case "J":
      const updatedJacks = cards.map((card) => ({
        ...card,
        suit: jackSuit,
      }));

      lobby.whoIsMove = nextPlayerMove(lobby.randomPosition, whoseMove);
      lobby.board = [...board, ...updatedJacks];
      console.log("LobbyCOUNT AFTET J", lobby.board);
      removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);
      lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
      break;

    default:
      lobby.whoIsMove = nextPlayerMove(lobby.randomPosition, whoseMove);
      //const board = lobby.board;
      lobby.board = [...board, ...cards];

      removeCardsAfterMoveFromHand(lobby.lobbyMembers, whoseMove, cards);
      lobby.countPlayersCards = checkCountOfPlayerCards(lobby.lobbyMembers);
    //sumCardsPoint(lobby);
    // console.log(lobby.lobbyMembers[0].hand);
    // console.log(lobby.lobbyMembers[1].hand);

    //   console.log("шо тут взагалі є: ", lobby);
    //console.log(" ТЕ ШО В РУУУУУМС", rooms[lobbyID]);

    // console.log("   А ВИПОВНИВСЯ ДЕФОЛТ");
    // console.log(value);
    // console.log(typeof value);
  }
}

module.exports.nextMove = nextMove;
