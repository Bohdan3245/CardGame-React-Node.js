function nextPlayerMove(randomPosition, whoseMove) {
  console.log("ТЕ ШО В ФУНКЦІЇ NEXTPLAYERMOVE", randomPosition);
  let playerIndex = randomPosition.indexOf(whoseMove);
  if (playerIndex === randomPosition.length - 1) {
    return randomPosition[0];
  } else {
    return randomPosition[playerIndex + 1];
  }
}

module.exports.nextPlayerMove = nextPlayerMove;
