const { getRoomsList } = require("../../sockets/rooms");

function randomPosition(lobbyID) {
  const rooms = getRoomsList();
  const lobbyMembers = rooms[lobbyID].lobbyMembers;
  rooms[lobbyID].firstMove = "";
  // console.log("ФУНКЦІЯ ВИКЛИКАНА!", lobbyMembers);
  let nameList = [];
  for (user of lobbyMembers) {
    nameList.push(user.name);
  }
  // console.log(nameList);

  for (let i = nameList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nameList[i], nameList[j]] = [nameList[j], nameList[i]];
  }

  // console.log(nameList);
  rooms[lobbyID].randomPosition = nameList;
  //позначаєм хто буде першим ходити
  const firstPlayerIndex = rooms[lobbyID].lobbyMembers.findIndex(
    (user) => user.name == nameList[0]
  );
  //rooms[lobbyID].lobbyMembers[firstPlayerIndex].firstMove = true;
  rooms[lobbyID].whoIsMove = nameList[0];
  //let players = [];
}

module.exports.randomPosition = randomPosition;
