const cardDeck = [
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

function createDeck() {
  let deck = cardDeck.map((item) => ({ ...item }));
  console.log(deck);
  return deck;
}

module.exports.createDeck = createDeck;
