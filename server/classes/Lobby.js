const GameEngine = require("./GameEngine");
const Player = require("./Player");
const lobbyStorage = require("../lobbyStorage/lobbyStorage");

class Lobby {
  constructor(lobbyID) {
    this.lobbyID = lobbyID;
    this.lobbyAdmin = "";
    this.gameStarted = false;
    this.members = [];
    this.countOfReady = 0;
    this.numberOfRound = 1;
    this.gameFinished = false;
    this.nameOfLosers = [];
    this.playerPosition = [];
    this.firstMove = "";
    this.whoIsMove = "";
    this.countPlayersCard = [];
    this.deck = [];
    this.board = [];
    this.engine = new GameEngine(this);
  }

  addPlayer(name, socketID, lobbyID) {
    const player = new Player(name, socketID, lobbyID);
    this.members.push(player);
    return player;
  }

  getPlayers() {
    return this.members;
  }

  getPlayerIndex(name) {
    return this.members.findIndex((p) => p.name === name);
  }

  getPlayerPositionIndex(name) {
    return this.playerPosition.indexOf(name);
  }

  getNextPlayerPostionIndex(name) {
    return (this.playerPosition.indexOf(name) + 1) % this.playerPosition.length;
  }

  removePlayer(name) {
    //delete lobby if last player leave
    if (this.members.length === 1) {
      lobbyStorage.delete(this.lobbyID);
      return;
    }

    const index = this.getPlayerIndex(name);

    //pass lobbyAdmin status to next player
    if (this.lobbyAdmin === name) {
      this.lobbyAdmin = this.members[index + 1].name;
    }
    //delete player
    this.members.splice(index, 1);
  }

  getCountOfPlayers() {
    return this.members.length;
  }

  countOfPlayersCards() {
    let nameAndCountCards = [];
    for (let player of this.members) {
      nameAndCountCards.push({
        name: player.name,
        cardCount: player.hand.length,
      });
    }
    //console.log("Ім'я та кількість карт гравців:", nameAndCountCards);
    this.countPlayersCard = nameAndCountCards;
    return nameAndCountCards;
  }

  resetReadyStatus() {
    for (let player of this.members) {
      player.readyStatus = false;
    }
  }
}

module.exports = Lobby;
