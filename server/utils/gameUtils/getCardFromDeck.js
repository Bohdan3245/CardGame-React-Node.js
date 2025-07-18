const { getPlayerIndex } = require("./getPlayerIndex");
const { shuffleDeck } = require("./shuffleDeck");
function getCardFromDeck(lobby, deck, name, number) {
  //індекс гравця якому потрібна карта
  const index = getPlayerIndex(lobby.lobbyMembers, name);
  // //додавання останньої карти колоди на руки гравцю
  // lobby.lobbyMembers[index].hand.push(deck[deck.length - 1]);
  // //виделання останньої карти з колоди
  // deck.pop();
  // //   console.log("чи додалась карта:", lobbyMembers[index].hand);
  // //   console.log(deck);
  // if (deck.length === 0) {
  //   lobby.deck = shuffleDeck(lobby.board.slice(0, -4));
  // }

  // if (lobby.deck.length === 0 || number > lobby.deck.length) {
  //   lobby.deck = shuffleDeck(lobby.board.slice(0, -4));
  // }

  let i = 0;
  while (i < number) {
    if (lobby.deck.length === 0) {
      const cardsToReshuffle = lobby.board.slice(0, -4).map((card) => {
        if (card.value === "J") {
          return { ...card, suit: "" }; // повернути копію з порожньою мастю
        }
        return card;
      });
      lobby.deck = shuffleDeck(cardsToReshuffle);
      //видаляєм карти які пішли перемішуватись в колоду
      const tempBoard = lobby.board.slice(-4);
      lobby.board = tempBoard;
      console.log("колода перетосувалась: ", lobby.deck);
      console.log(
        "відбій який лишився =22=2==2=2=2=2==2=2=2=2=2=2=2==2=2=2=2: ",
        lobby.board
      );
    }

    lobby.lobbyMembers[index].hand.push(lobby.deck[lobby.deck.length - 1]);
    lobby.deck.pop();
    i++;
    console.log("колода після видачі карти", lobby.deck);
  }
}

module.exports.getCardFromDeck = getCardFromDeck;
