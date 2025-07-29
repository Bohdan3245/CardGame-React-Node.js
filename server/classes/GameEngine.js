class GameEngine {
  constructor(lobby) {
    this.lobby = lobby;
    this.deck = [
      { suit: "♠", value: "6", points: 0 },
      { suit: "♠", value: "7", points: 0 },
      { suit: "♠", value: "8", points: 0 },
      { suit: "♠", value: "9", points: 0 },
      { suit: "♠", value: "10", points: 10 },
      { suit: "", value: "J", points: 25 },
      { suit: "♠", value: "Q", points: 50 },
      { suit: "♠", value: "K", points: 10 },
      { suit: "♠", value: "A", points: 15 },
      { suit: "♥", value: "6", points: 0 },
      { suit: "♥", value: "7", points: 0 },
      { suit: "♥", value: "8", points: 0 },
      { suit: "♥", value: "9", points: 0 },
      { suit: "♥", value: "10", points: 10 },
      { suit: "", value: "J", points: 25 },
      { suit: "♥", value: "Q", points: 10 },
      { suit: "♥", value: "K", points: 10 },
      { suit: "♥", value: "A", points: 15 },
      { suit: "♦", value: "6", points: 0 },
      { suit: "♦", value: "7", points: 0 },
      { suit: "♦", value: "8", points: 0 },
      { suit: "♦", value: "9", points: 0 },
      { suit: "♦", value: "10", points: 10 },
      { suit: "", value: "J", points: 25 },
      { suit: "♦", value: "Q", points: 10 },
      { suit: "♦", value: "K", points: 10 },
      { suit: "♦", value: "A", points: 15 },
      { suit: "♣", value: "6", points: 0 },
      { suit: "♣", value: "7", points: 0 },
      { suit: "♣", value: "8", points: 0 },
      { suit: "♣", value: "9", points: 0 },
      { suit: "♣", value: "10", points: 10 },
      { suit: "", value: "J", points: 25 },
      { suit: "♣", value: "Q", points: 10 },
      { suit: "♣", value: "K", points: 10 },
      { suit: "♣", value: "A", points: 15 },
    ];
  }

  setRandomPosition() {
    let playerList = [];
    for (let player of this.lobby.members) {
      playerList.push(player.name);
    }

    for (let i = playerList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerList[i], playerList[j]] = [playerList[j], playerList[i]];
    }

    this.lobby.playerPosition = playerList;
    this.lobby.whoIsMove = playerList[0];
  }

  shuffleDeck(gameDeck) {
    if (gameDeck) {
      for (let i = gameDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameDeck[i], gameDeck[j]] = [gameDeck[j], gameDeck[i]];
      }

      return (this.lobby.deck = gameDeck);
    } else {
      let tempDeck = [...this.deck];

      for (let i = tempDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tempDeck[i], tempDeck[j]] = [tempDeck[j], tempDeck[i]];
      }

      return (this.lobby.deck = tempDeck);
    }
  }

  dealingCards() {
    const hands = this.lobby.members.map(() => this.lobby.deck.splice(0, 5));

    // const hands = [
    //   [
    //     { suit: "♠", value: "Q", points: 0 },
    //     { suit: "♠", value: "A", points: 0 },
    //     { suit: "♥", value: "A", points: 0 },
    //     { suit: "♥", value: "A", points: 10 },
    //     { suit: "♣", value: "7", points: 10 },
    //   ],
    //   [
    //     { suit: "♠", value: "Q", points: 0 },
    //     { suit: "♥", value: "A", points: 0 },
    //     { suit: "♥", value: "A", points: 10 },
    //     { suit: "♥", value: "10", points: 10 },
    //     { suit: "♥", value: "7", points: 10 },
    //   ],
    //   [
    //     { suit: "♠", value: "Q", points: 0 },
    //     { suit: "♥", value: "A", points: 0 },
    //     { suit: "♥", value: "A", points: 10 },
    //     { suit: "♥", value: "10", points: 10 },
    //     { suit: "♥", value: "7", points: 10 },
    //   ],
    //   [
    //     { suit: "♠", value: "Q", points: 0 },
    //     { suit: "♥", value: "A", points: 0 },
    //     { suit: "♥", value: "A", points: 10 },
    //     { suit: "♥", value: "10", points: 10 },
    //     { suit: "♥", value: "7", points: 10 },
    //   ],
    // ];

    this.lobby.members = this.lobby.members.map((player, index) => {
      if (player.name === this.lobby.whoIsMove) {
        this.lobby.board.push(hands[index][0]);
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
  }

  giveCard(toWhom, quantity) {
    const index = this.lobby.getPlayerIndex(toWhom);

    let i = 0;
    while (i < quantity) {
      if (this.lobby.deck.length === 0) {
        const cardsToReshuffle = this.lobby.board.slice(0, -4).map((card) => {
          if (card.value === "J") {
            return { ...card, suit: "" }; // повернути копію з порожньою мастю
          }
          return card;
        });

        this.shuffleDeck(cardsToReshuffle);
        //видаляєм карти які пішли перемішуватись в колоду
        const tempBoard = this.lobby.board.slice(-4);
        this.lobby.board = tempBoard;
      }

      this.lobby.members[index].hand.push(
        this.lobby.deck[this.lobby.deck.length - 1]
      );
      this.lobby.deck.pop();
      i++;
    }
  }

  checkConditiosOfFirstMove() {
    const firstPlayerIndex = this.lobby.getPlayerIndex(this.lobby.whoIsMove);
    const firstPlayerPositionIndex = this.lobby.playerPosition.indexOf(
      this.lobby.whoIsMove
    );
    const firstPlayerName = this.lobby.playerPosition[firstPlayerPositionIndex];

    const nextPlayerIndexP =
      (firstPlayerPositionIndex + 1) % this.lobby.playerPosition.length;
    const nextPlayerName = this.lobby.playerPosition[nextPlayerIndexP];

    const cardValue = this.lobby.board.at(-1).value;
    const cardSuit = this.lobby.board.at(-1).suit;

    if (cardValue === "6") {
      // whoIsMove not change if first card is 6
      return;
    }

    const hasOneMoreSameCard = this.lobby.members[firstPlayerIndex].hand.some(
      (c) => c.value === cardValue
    );

    switch (cardValue) {
      case "7":
        if (hasOneMoreSameCard) {
          this.giveCard(nextPlayerName, 1);
          this.lobby.firstMove = firstPlayerName;
        } else {
          this.giveCard(nextPlayerName, 1);
          this.lobby.whoIsMove = nextPlayerName;
        }
        break;

      case "8":
        if (hasOneMoreSameCard) {
          this.giveCard(nextPlayerName, 2);
          this.lobby.firstMove = firstPlayerName;
        } else {
          this.giveCard(nextPlayerName, 2);
          this.lobby.whoIsMove =
            this.lobby.playerPosition[
              (firstPlayerPositionIndex + 2) % this.lobby.playerPosition.length
            ];
        }

        break;

      case "Q":
        if (hasOneMoreSameCard) {
          if (cardSuit === "♠") {
            this.giveCard(nextPlayerName, 5);
            this.lobby.whoIsMove =
              this.lobby.playerPosition[
                (firstPlayerPositionIndex + 2) %
                  this.lobby.playerPosition.length
              ];
            return;
          } else {
            this.lobby.firstMove = firstPlayerName;
            return;
          }
        } else {
          if (cardSuit === "♠") {
            this.giveCard(nextPlayerName, 5);
            this.lobby.whoIsMove =
              this.lobby.playerPosition[
                (firstPlayerPositionIndex + 2) %
                  this.lobby.playerPosition.length
              ];
            return;
          }
          this.lobby.whoIsMove = nextPlayerName;
        }

        break;

      case "A":
        if (hasOneMoreSameCard) {
          this.lobby.firstMove = firstPlayerName;
        } else {
          this.lobby.whoIsMove =
            this.lobby.playerPosition[
              (firstPlayerPositionIndex + 2) % this.lobby.playerPosition.length
            ];
        }
        break;

      case "J":
        this.lobby.firstMove = firstPlayerName;
        break;

      default:
        if (hasOneMoreSameCard) {
          this.lobby.firstMove = firstPlayerName;
        } else {
          this.lobby.whoIsMove = nextPlayerName;
        }
    }
  }

  removeCardFromHand(name, cards) {
    const playerIndex = this.lobby.getPlayerIndex(name);
    const cardsToRemove = [...cards];
    const newHand = [];

    for (const card of this.lobby.members[playerIndex].hand) {
      // Шукаємо, чи така карта є серед тих, якими походили
      const indexInToRemove = cardsToRemove.findIndex(
        (c) => c.value === card.value && c.suit === card.suit
      );

      if (indexInToRemove !== -1) {
        // Видаляємо цю карту з списку тих, які треба видалити
        cardsToRemove.splice(indexInToRemove, 1);
        // Не додаємо в нову руку (тобто видаляємо її)
      } else {
        // Якщо ця карта не була відіграна — залишаємо її
        newHand.push(card);
      }
    }

    this.lobby.members[playerIndex].hand = newHand;
  }

  setNextMove(name, cards, eightToAll, firstMoveCard, jackSuit) {
    let value = cards[0].value;

    if (value === "6") {
      let cardOverSix = cards.filter((c) => c.value !== "6");

      if (cardOverSix.length === 0) {
        value = "6";
      } else {
        value = cardOverSix[0].value;
      }

      const sixCards = cards.filter((c) => c.value === "6");

      this.lobby.board = [...this.lobby.board, ...sixCards];
      this.removeCardFromHand(name, sixCards);

      cards = cardOverSix;
    }

    switch (value) {
      case "6":
        this.sixPlay(name, cards);
        break;

      case "7":
        this.sevenPlay(name, cards);
        break;

      case "8":
        this.eightPlay(name, cards, eightToAll, firstMoveCard);
        break;

      case "J":
        this.jackPlay(name, cards, jackSuit);
        break;

      case "Q":
        this.queenPlay(name, cards);
        break;

      case "A":
        this.acePlay(name, cards, firstMoveCard);
        break;

      default:
        this.anotherCardPlay(name, cards);
    }

    if (this.checkWinningRound(name)) {
      this.sumCardPoints(name, cards);
      return true;
    } else {
      return false;
    }
  }

  checkWinningRound(name) {
    const playerIndex = this.lobby.getPlayerIndex(name);
    if (this.lobby.board.at(-1).value === "6") {
      return false;
    }

    if (this.lobby.members[playerIndex].hand.length === 0) {
      return true;
    }

    return false;
  }

  checkLoseGame() {
    let losersArr = [];
    for (let player of this.lobby.members) {
      if (player.points > 125) {
        losersArr.push(player.name);
        player.countOfGameLose++;
      }
    }
    this.lobby.nameOfLosers = losersArr;
    if (losersArr.length > 0) {
      this.lobby.gameFinished = true;
      return true;
    }
  }

  sumCardPoints(name, cards) {
    for (const player of this.lobby.members) {
      const playerIndex = this.lobby.getPlayerIndex(player.name);
      let sumPoints = 0;

      if (this.lobby.members[playerIndex].name === name) {
        const lastCard = cards.at(-1);

        if (lastCard.suit === "♠" && lastCard.value === "Q") {
          this.lobby.members[playerIndex].points -= 50;
          this.lobby.members[playerIndex].howManyPointsAdd = "-50";
          continue;
        }

        const jCount = cards.filter((c) => c.value === "J").length;
        if (jCount > 0) {
          const penalty = 25 * jCount;
          this.lobby.members[playerIndex].points -= penalty;
          this.lobby.members[playerIndex].howManyPointsAdd = `-${penalty}`;
          continue;
        }
      }

      // якщо нема карт – просто додати 0
      if (player.hand.length === 0) {
        sumPoints = 0;
      } else {
        for (const card of player.hand) {
          sumPoints += card.points;
        }
      }

      const total = this.lobby.members[playerIndex].points + sumPoints;

      if (total === 125) {
        this.lobby.members[
          playerIndex
        ].howManyPointsAdd = `${sumPoints} + ${this.lobby.members[playerIndex].points} = 125`;
        this.lobby.members[playerIndex].points = 0;
        continue;
      }

      this.lobby.members[playerIndex].howManyPointsAdd =
        sumPoints === 0 ? "" : `+${sumPoints}`;
      this.lobby.members[playerIndex].points = total;
    }
  }

  sixPlay(name, cards) {
    this.lobby.whoIsMove = name;
    this.lobby.board = [...this.lobby.board, ...cards];
    this.removeCardFromHand(name, cards);
    this.lobby.countOfPlayersCards();
  }

  sevenPlay(name, cards) {
    const nextPlayerName =
      this.lobby.playerPosition[this.lobby.getNextPlayerPostionIndex(name)];

    this.giveCard(nextPlayerName, cards.length);
    this.lobby.whoIsMove =
      this.lobby.playerPosition[this.lobby.getNextPlayerPostionIndex(name)];
    this.lobby.board = [...this.lobby.board, ...cards];
    this.removeCardFromHand(name, cards);
    this.lobby.countOfPlayersCards();
    this.lobby.firstMove = "";
  }

  eightPlay(name, cards, eightToAll, firstMoveCard) {
    const playerIndex = this.lobby.getPlayerPositionIndex(name);
    const nextPlayerName =
      this.lobby.playerPosition[this.lobby.getNextPlayerPostionIndex(name)];

    switch (firstMoveCard === "8") {
      case true:
        if (eightToAll) {
          let skipOnce = true;
          let countOf8 = cards.length;
          let lastplayer = "";
          for (let i = 1; i <= countOf8; i++) {
            const index = (playerIndex + i) % this.lobby.getCountOfPlayers();
            const player = this.lobby.playerPosition[index];
            console.log("гравці в середині фора", player);
            if (player === name) {
              countOf8++;
              continue;
            }

            if (
              player ===
                this.lobby.playerPosition[
                  this.lobby.getNextPlayerPostionIndex(name)
                ] &&
              skipOnce
            ) {
              countOf8++;
              skipOnce = false;
              continue;
            }
            this.giveCard(player, 2);

            lastplayer = player;
          }

          this.lobby.whoIsMove =
            this.lobby.playerPosition[
              (this.lobby.playerPosition.indexOf(lastplayer) + 1) %
                this.lobby.getCountOfPlayers()
            ];
          this.lobby.firstMove = "";
        } else {
          this.giveCard(nextPlayerName, cards.length * 2);
          this.lobby.whoIsMove =
            this.lobby.playerPosition[
              (playerIndex + 2) % this.lobby.getCountOfPlayers()
            ];
          this.lobby.firstMove = "";
        }
        break;

      case false:
        if (eightToAll) {
          let countOf8 = cards.length;
          let nextMovePlayer = "";
          for (let i = 1; i <= countOf8; i++) {
            const index = (playerIndex + i) % this.lobby.getCountOfPlayers();
            const player = this.lobby.playerPosition[index];
            if (player === name) {
              countOf8++;
              continue;
            }
            this.giveCard(player, 2);
            nextMovePlayer = player;
          }

          this.lobby.firstMove = "";

          //пропускають всі кому випала 8 скіпаючи гравця який походив вісьмірками
          this.lobby.whoIsMove =
            this.lobby.playerPosition[
              (this.lobby.playerPosition.indexOf(nextMovePlayer) + 1) %
                this.lobby.getCountOfPlayers()
            ];
        } else {
          this.lobby.firstMove = "";
          this.giveCard(nextPlayerName, cards.length * 2);
          this.lobby.whoIsMove =
            this.lobby.playerPosition[
              (playerIndex + 2) % this.lobby.getCountOfPlayers()
            ];
        }
        break;
    }

    this.lobby.board = [...this.lobby.board, ...cards];
    this.removeCardFromHand(name, cards);
    this.lobby.countOfPlayersCards();
  }

  jackPlay(name, cards, jackSuit) {
    const updatedJacks = cards.map((card) => ({
      ...card,
      suit: jackSuit,
    }));

    this.lobby.whoIsMove =
      this.lobby.playerPosition[this.lobby.getNextPlayerPostionIndex(name)];
    this.lobby.board = [...this.lobby.board, ...updatedJacks];
    this.removeCardFromHand(name, cards);
    this.lobby.countOfPlayersCards();
    this.lobby.firstMove = "";
  }

  queenPlay(name, cards) {
    const playerIndex = this.lobby.getPlayerPositionIndex(name);

    if (cards.at(-1).suit === "♠") {
      const nextPlayerName =
        this.lobby.playerPosition[this.lobby.getNextPlayerPostionIndex(name)];
      this.giveCard(nextPlayerName, 5);

      this.lobby.whoIsMove =
        this.lobby.playerPosition[
          (playerIndex + 2) % this.lobby.getCountOfPlayers()
        ];
    } else {
      this.lobby.whoIsMove =
        this.lobby.playerPosition[
          (playerIndex + 1) % this.lobby.getCountOfPlayers()
        ];
    }
    this.lobby.firstMove = "";
    this.lobby.board = [...this.lobby.board, ...cards];
    this.removeCardFromHand(name, cards);
    this.lobby.countOfPlayersCards();
  }

  acePlay(name, cards, firstMoveCard) {
    const playerIndex = this.lobby.getPlayerPositionIndex(name);
    const nextPlayerIndex = this.lobby.getNextPlayerPostionIndex(name);

    let skipOnce = true;
    let countOfCards = cards.length;
    let lastplayer = "";

    if (firstMoveCard === "A") {
      for (let i = 1; i <= countOfCards; i++) {
        const index = (playerIndex + i) % this.lobby.getCountOfPlayers();
        const player = this.lobby.playerPosition[index];
        if (player === name) {
          countOfCards++;
          continue;
        }

        if (player === this.lobby.playerPosition[nextPlayerIndex] && skipOnce) {
          countOfCards++;
          skipOnce = false;
          continue;
        }
        lastplayer = player;
      }

      this.lobby.whoIsMove =
        this.lobby.playerPosition[
          (this.lobby.playerPosition.indexOf(lastplayer) + 1) %
            this.lobby.getCountOfPlayers()
        ];
      this.lobby.firstMove = "";
    } else {
      for (let i = 1; i <= countOfCards; i++) {
        const index = (playerIndex + i) % this.lobby.getCountOfPlayers();
        const player = this.lobby.playerPosition[index];
        if (player === name) {
          countOfCards++;
          continue;
        }
        lastplayer = player;
      }
      this.lobby.firstMove = "";

      this.lobby.whoIsMove =
        this.lobby.playerPosition[
          (this.lobby.playerPosition.indexOf(lastplayer) + 1) %
            this.lobby.getCountOfPlayers()
        ];
    }

    this.lobby.board = [...this.lobby.board, ...cards];
    this.removeCardFromHand(name, cards);
    this.lobby.countOfPlayersCards();
  }

  anotherCardPlay(name, cards) {
    this.lobby.firstMove = "";
    this.lobby.whoIsMove =
      this.lobby.playerPosition[this.lobby.getNextPlayerPostionIndex(name)];
    this.lobby.board = [...this.lobby.board, ...cards];
    this.removeCardFromHand(name, cards);
    this.lobby.countOfPlayersCards();
  }

  setJackSuitFirstMove(name, suit) {
    const updateBoard = this.lobby.board.map((card) => ({
      ...card,
      suit: suit,
    }));
    this.lobby.board = [...updateBoard];
    const nextPlayerIndex = this.lobby.getNextPlayerPostionIndex(name);
    this.lobby.firstMove = "";
    this.lobby.whoIsMove = this.lobby.playerPosition[nextPlayerIndex];
    this.lobby.countOfPlayersCards();
  }

  skipMove(name) {
    const nextPlayerIndex = this.lobby.getNextPlayerPostionIndex(name);
    this.lobby.whoIsMove = this.lobby.playerPosition[nextPlayerIndex];
  }

  setFirstPlayerForNewRound() {
    let pointsArr = [];
    for (let player of this.lobby.members) {
      const tempObj = { name: player.name, points: player.points };
      pointsArr.push(tempObj);
    }

    const maxPointsPlayer = pointsArr.reduce((max, player) =>
      player.points > max.points ? player : max
    );
    return maxPointsPlayer.name;
  }

  resetAllPlayersCards() {
    for (let player of this.lobby.members) {
      player.hand = [];
    }
  }

  resetAllPlayersPoints() {
    for (let player of this.lobby.members) {
      player.points = 0;
      player.howManyPointsAdd = "";
    }
  }

  prepearToNewRound() {
    this.lobby.numberOfRound++;
    this.lobby.firstMove = "";
    this.lobby.whoIsMove = this.setFirstPlayerForNewRound();
    this.resetAllPlayersCards();
    this.lobby.board = [];
    this.lobby.deck = [];
  }

  prepearToNewGame() {
    this.lobby.numberOfRound = 1;
    this.lobby.firstMove = "";
    this.lobby.whoIsMove = "";
    this.resetAllPlayersCards();
    this.resetAllPlayersPoints();
    this.lobby.board = [];
    this.lobby.deck = [];
  }

  leaveGame(name) {
    const playerIndex = this.lobby.getPlayerIndex(name);
    const playerPositionIndex = this.lobby.getPlayerPositionIndex(name);

    const countCardsIndex = this.lobby.countPlayersCard.findIndex(
      (p) => p.name === name
    );
    //add cards of the player who left to the deck
    this.lobby.deck.push(...this.lobby.members[playerIndex].hand);

    if (this.lobby.whoIsMove === name) {
      this.lobby.whoIsMove =
        this.lobby.playerPosition[
          (playerPositionIndex + 1) % this.lobby.getCountOfPlayers()
        ];
    }

    this.lobby.removePlayer(name);
    this.lobby.countPlayersCard.splice(countCardsIndex, 1);
    this.lobby.playerPosition.splice(playerPositionIndex, 1);
  }

  sortCards(cards) {
    const valueSample = ["J", "A", "K", "Q", "10", "9", "8", "7", "6"];
    const suitSample = ["♠", "♥", "♣", "♦"];
    const valuePriority = new Map(
      valueSample.map((value, index) => [value, index])
    );
    const suitPriority = new Map(
      suitSample.map((value, index) => [value, index])
    );

    let suitSorted = cards.sort(
      (a, b) => suitPriority.get(a.value) - suitPriority.get(b.value)
    );

    return suitSorted.sort(
      (a, b) => valuePriority.get(a.value) - valuePriority.get(b.value)
    );
  }
}

module.exports = GameEngine;
