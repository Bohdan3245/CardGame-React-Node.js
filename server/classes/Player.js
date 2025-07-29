class Player {
  constructor(name, socketID, lobbyID) {
    this.name = name;
    this.socketID = socketID;
    this.lobbyID = lobbyID;
    this.hand = [];
    this.points = 0;
    this.readyStatus = false;
    this.howManyPointsAdd = "0";
    this.countOfGameLose = 0;
  }

  getSocketID() {
    return this.socketID;
  }
}

module.exports = Player;
