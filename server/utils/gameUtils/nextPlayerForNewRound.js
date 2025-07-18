function nextPlayerForNewRound(lobbyMembers) {
  let pointsArr = [];
  for (let player of lobbyMembers) {
    const tempObj = { name: player.name, points: player.points };
    pointsArr.push(tempObj);
  }
  console.log("МАСИВ ОБЬЄКТІВ З ІМЕНАМИ І КІЛЬКІСТЮ ПОІНТІВ", pointsArr);

  const maxPointsPlayer = pointsArr.reduce((max, player) =>
    player.points > max.points ? player : max
  );
  console.log("ІМ'Я ТОГО ХТО БУДЕ ХОДИТИ ПЕРШИМ: ", maxPointsPlayer.name);
  return maxPointsPlayer.name;
}

module.exports.nextPlayerForNewRound = nextPlayerForNewRound;
