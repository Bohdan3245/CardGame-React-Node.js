function checkCountOfPlayerCards(lobbyMembers) {
  let nameAndCountCards = [];
  for (player of lobbyMembers) {
    nameAndCountCards.push({
      name: player.name,
      cardCount: player.hand.length,
    });
  }
  console.log("Ім'я та кількість карт гравців:", nameAndCountCards);
  return nameAndCountCards;
}

module.exports.checkCountOfPlayerCards = checkCountOfPlayerCards;
