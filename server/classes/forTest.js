const GameEngine = require("./GameEngine");
const Player = require("./Player");
const Lobby = require("./Lobby");

let lobby = new Lobby("asd");

lobby.addPlayer("Bohdan", "qweasdqweasd", "asd");
lobby.addPlayer("Eren", "asdzxcasdzxc", "asd");
lobby.addPlayer("Armin", "asdzxcasdedc", "asd");

lobby.engine.setRandomPosition();

lobby.engine.shuffleDeck();

lobby.engine.dealingCards();

// console.table(lobby.deck);

// console.log(lobby);

//console.log(lobby.engine.deck);

lobby.engine.checkConditiosOfFirstMove();

// console.log(lobby.whoIsMove);
// console.log(lobby.firstMove);
console.log(lobby);
console.log("Board: ", lobby.board);

console.log(lobby.members[0].name);
console.table(lobby.members[0].hand);
console.log(lobby.members[1].name);
console.table(lobby.members[1].hand);
console.log(lobby.members[2].name);
console.table(lobby.members[2].hand);
