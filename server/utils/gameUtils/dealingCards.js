const { getPlayerIndex } = require("./getPlayerIndex");
const { checkCountOfPlayerCards } = require("./checkCountOfPlayersCards");

function dealingCards(lobbyData, deck, socket) {
  const firstMovePlayerName = lobbyData.whoIsMove;

  const firstMovePlayerIndexRP =
    lobbyData.randomPosition.indexOf(firstMovePlayerName);

  const firstMovePlayerIndexLM = lobbyData.lobbyMembers.findIndex(
    (p) => p.name === firstMovePlayerName
  );

  const nextPlayerNameRP =
    lobbyData.randomPosition[
      (firstMovePlayerIndexRP + 1) % lobbyData.randomPosition.length
    ];
  const nextPlayerIndexRP = lobbyData.randomPosition.indexOf(nextPlayerNameRP);

  const nextPlayerIndexLM = lobbyData.lobbyMembers.findIndex(
    (p) => p.name === lobbyData.randomPosition[nextPlayerIndexRP]
  );

  const hands = lobbyData.lobbyMembers.map(() => deck.splice(0, 5));
  // const hands = [
  //   [
  //     { suit: "♠", value: "Q", points: 0 },
  //     { suit: "", value: "J", points: 10 },
  //     { suit: "♥", value: "Q", points: 0 },
  //     { suit: "♥", value: "10", points: 10 },
  //     { suit: "♣", value: "7", points: 10 },
  //   ],
  //   [
  //     { suit: "♠", value: "Q", points: 0 },
  //     { suit: "", value: "J", points: 10 },
  //     { suit: "♥", value: "Q", points: 0 },
  //     { suit: "♥", value: "10", points: 10 },
  //     { suit: "♥", value: "7", points: 10 },
  //   ],
  //   [
  //     { suit: "♠", value: "Q", points: 0 },
  //     { suit: "", value: "J", points: 10 },
  //     { suit: "♥", value: "Q", points: 0 },
  //     { suit: "♥", value: "10", points: 10 },
  //     { suit: "♥", value: "7", points: 10 },
  //   ],
  //   [
  //     { suit: "♠", value: "Q", points: 0 },
  //     { suit: "", value: "J", points: 10 },
  //     { suit: "♥", value: "Q", points: 0 },
  //     { suit: "♥", value: "10", points: 10 },
  //     { suit: "♥", value: "7", points: 10 },
  //   ],
  // ];

  lobbyData.board = [];
  lobbyData.lobbyMembers = lobbyData.lobbyMembers.map((player, index) => {
    if (player.name === lobbyData.whoIsMove) {
      // Додаємо першу карту в deck
      lobbyData.board.push(hands[index][0]);
      hands[index].shift();

      return {
        ...player,
        hand: hands[index],
      };
    }

    return {
      ...player,
      hand: hands[index],
    };
  });

  //якшо у гравця (який типу роздає) є ще одна карта такої самої value то ходить він, якшо нема, то ходить наступний
  if (lobbyData.board[0].value === "6") {
    //якшо при роздачі перша карта оказалась 6, тоді її перший гравець повинен накрити
    lobbyData.whoIsMove = lobbyData.randomPosition[firstMovePlayerIndexRP];
  } else if (lobbyData.board[0].value === "7") {
    // const nextPlayerIndex = getPlayerIndex(
    //   lobbyData.lobbyMembers,
    //   lobbyData.randomPosition[1]
    // );
    // const firstPlayerIndex = getPlayerIndex(
    //   lobbyData.lobbyMembers,
    //   lobbyData.randomPosition[0]
    // );

    // const nextPlayerIndex =
    //   lobbyData.randomPosition[
    //     (firstMovePlayerIndexRP + 1) % lobbyData.randomPosition.length
    //   ];
    //deck.pop() видаляє останній елемент масива, і повертає цей останній елемент
    lobbyData.lobbyMembers[nextPlayerIndexLM].hand.push(deck.pop());
    //якшо у першого гравця більше немає семірок, то ходить наступний, якшо є, то може докинути
    if (
      !lobbyData.lobbyMembers[firstMovePlayerIndexLM].hand.some(
        (card) => card.value === lobbyData.board[0].value
      )
    ) {
      lobbyData.whoIsMove = lobbyData.randomPosition[nextPlayerIndexRP];
    } else {
      //це відправляється на клієнт першому гравцю шоб клієнт зрозумів шо він ще ходить і шоб він зміг покласти карту яка за значенням = 7 а не будь яку з такою ж мастью як перша карта на дошці
      lobbyData.whoIsMove = lobbyData.randomPosition[firstMovePlayerIndexRP];
      lobbyData.firstMove = firstMovePlayerName;
      console.log("FIRST MOVE ПОСТАВИВСЯ В 7");
    }
  } else if (lobbyData.board[0].value === "8") {
    //додавання двох карт наступному гравцю якшо гра почалась з 8
    const tempCards = deck.slice(-2);
    lobbyData.lobbyMembers[nextPlayerIndexLM].hand.push(...tempCards);
    deck.splice(-2); // видалення з колоди двох доданих карт | (-2) означає останні два елемента

    if (
      !lobbyData.lobbyMembers[firstMovePlayerIndexLM].hand.some(
        (card) => card.value === lobbyData.board[0].value
      )
    ) {
      // перший походив 8, дргий гравець пропускає, третій ходить
      lobbyData.whoIsMove =
        lobbyData.randomPosition[
          (firstMovePlayerIndexRP + 2) % lobbyData.randomPosition.length
        ];
    } else {
      lobbyData.firstMove = firstMovePlayerName;
      console.log("FIRST MOVE ПОСТАВИВСЯ В 8");
    }
  } else if (
    lobbyData.board[0].value === "Q" &&
    lobbyData.board[0].suit === "♠"
  ) {
    const tempCards = deck.slice(-5);
    lobbyData.lobbyMembers[nextPlayerIndexLM].hand.push(...tempCards);
    deck.splice(-5);

    lobbyData.whoIsMove =
      lobbyData.randomPosition[
        (firstMovePlayerIndexRP + 2) % lobbyData.randomPosition.length
      ];
    lobbyData.firstMove = "";
    console.log("FIRST MOVE ПОСТАВИВСЯ В Q♠");
  } else if (lobbyData.board[0].value === "A") {
    if (
      !lobbyData.lobbyMembers[firstMovePlayerIndexLM].hand.some(
        (card) => card.value === lobbyData.board[0].value
      )
    ) {
      lobbyData.whoIsMove =
        lobbyData.randomPosition[
          (firstMovePlayerIndexRP + 2) % lobbyData.randomPosition.length
        ];
    } else {
      lobbyData.firstMove = firstMovePlayerName;
      console.log("FIRST MOVE ПОСТАВИВСЯ В A");
    }
  } else if (lobbyData.board[0].value === "J") {
    lobbyData.firstMove = firstMovePlayerName;
    console.log("FIRST MOVE ПОСТАВИВСЯ В J");
  } else {
    if (
      !lobbyData.lobbyMembers[firstMovePlayerIndexLM].hand.some(
        (card) => card.value === lobbyData.board[0].value
      )
    ) {
      lobbyData.whoIsMove = lobbyData.randomPosition[nextPlayerIndexRP];
    } else {
      lobbyData.firstMove = firstMovePlayerName;
      console.log("FIRST MOVE ПОСТАВИВСЯ В УСІХ ІНШИХ ВИПАДКАХ");
    }
  }

  lobbyData.countPlayersCards = [];
  lobbyData.countPlayersCards = checkCountOfPlayerCards(lobbyData.lobbyMembers);

  lobbyData.deck = deck;
  console.log("LOBBY DATA AFTER DEALING CARTS: ", lobbyData);
  console.log("КАРТИ ПЕРШОГО ГРАВЦЯ", lobbyData.lobbyMembers[0].hand);
  console.log("КАРТИ ДРУГОГО ГРАВЦЯ", lobbyData.lobbyMembers[1].hand);
  return lobbyData;
}

module.exports.dealingCards = dealingCards;
