// const { getPlayerIndex } = require("./getPlayerIndex");
// function sumCardsPoint(lobby, whoIsMove, cards) {
//   const filteredCards = cards.filter((c) => c.value !== "6");

//   //проходиться по кожному учаснику lobbyMembers
//   for (let player of lobby.lobbyMembers) {
//     const playerIndex = getPlayerIndex(lobby.lobbyMembers, player.name);
//     // const playerName = player.name;
//     let sumPoints = 0;

//     if (lobby.lobbyMembers[playerIndex].name === whoIsMove) {
//       if (
//         filteredCards.at(-1).suit === "♠" &&
//         filteredCards.at(-1).value === "Q"
//       ) {
//         lobby.lobbyMembers[playerIndex].points -= 50;
//         lobby.lobbyMembers[playerIndex].howManyPointsAdd = "-50";
//         continue;
//       }

//       if (filteredCards.some((c) => c.value === "J")) {
//         lobby.lobbyMembers[playerIndex].points -= 25 * filteredCards.length;
//         lobby.lobbyMembers[playerIndex].howManyPointsAdd = `-${
//           25 * filteredCards.length
//         }`;
//         continue;
//       }
//     }
//     //підраховує суму поінтів всіх карт гравця
//     if (player.hand.length === 0) {
//       sumPoints = 0;
//     } else {
//       for (const card of player.hand) {
//         sumPoints += card.points;
//       }
//     }

//     if (lobby.lobbyMembers[playerIndex].points + sumPoints === 125) {
//       lobby.lobbyMembers[
//         playerIndex
//       ].howManyPointsAdd = `${sumPoints} + ${lobby.lobbyMembers[playerIndex].points} = 125`;
//       lobby.lobbyMembers[playerIndex].points = 0;
//       continue;
//     }

//     lobby.lobbyMembers[playerIndex].howManyPointsAdd = `+${sumPoints}`;
//     lobby.lobbyMembers[playerIndex].points += sumPoints;
//   }
// }
// module.exports.sumCardsPoint = sumCardsPoint;

const { getPlayerIndex } = require("./getPlayerIndex");

function sumCardsPoint(lobby, whoIsMove, cards) {
  const filteredCards = cards.filter((c) => c.value !== "6");

  for (const player of lobby.lobbyMembers) {
    const playerIndex = getPlayerIndex(lobby.lobbyMembers, player.name);
    let sumPoints = 0;

    if (lobby.lobbyMembers[playerIndex].name === whoIsMove) {
      const lastCard = filteredCards.at(-1);

      if (lastCard.suit === "♠" && lastCard.value === "Q") {
        lobby.lobbyMembers[playerIndex].points -= 50;
        lobby.lobbyMembers[playerIndex].howManyPointsAdd = "-50";
        continue;
      }

      const jCount = filteredCards.filter((c) => c.value === "J").length;
      if (jCount > 0) {
        const penalty = 25 * jCount;
        lobby.lobbyMembers[playerIndex].points -= penalty;
        lobby.lobbyMembers[playerIndex].howManyPointsAdd = `-${penalty}`;
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

    const total = lobby.lobbyMembers[playerIndex].points + sumPoints;

    if (total === 125) {
      lobby.lobbyMembers[
        playerIndex
      ].howManyPointsAdd = `${sumPoints} + ${lobby.lobbyMembers[playerIndex].points} = 125`;
      lobby.lobbyMembers[playerIndex].points = 0;
      continue;
    }

    lobby.lobbyMembers[playerIndex].howManyPointsAdd =
      sumPoints === 0 ? "" : `+${sumPoints}`;
    lobby.lobbyMembers[playerIndex].points = total;
  }
}

module.exports.sumCardsPoint = sumCardsPoint;
