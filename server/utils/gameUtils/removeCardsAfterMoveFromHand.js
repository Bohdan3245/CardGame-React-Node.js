function removeCardsAfterMoveFromHand(lobbyMembers, whoseMove, cards) {
  let indexOfPlayer = lobbyMembers.findIndex((user) => user.name == whoseMove);
  // lobbyMembers[indexOfPlayer].hand = lobbyMembers[indexOfPlayer].hand.filter(
  //   (c) => !cards.some((card) => card.value === c.value && card.suit === c.suit)
  // );
  // console.log("КАРТИ ТОГО ХТО ПОХОДИВ", lobbyMembers[indexOfPlayer].hand);
  const hand = lobbyMembers[indexOfPlayer].hand;

  // Створюємо копію карт, якими походили
  const cardsToRemove = [...cards];

  // Новий hand, де ми поштучно видаляємо лише відповідні карти
  const newHand = [];

  for (const card of hand) {
    // Шукаємо, чи така карта є серед тих, якими походили
    const indexInToRemove = cardsToRemove.findIndex(
      (c) => c.value === card.value && c.suit === card.suit
    );

    if (indexInToRemove !== -1) {
      // Видаляємо цю карту з списку тих, які треба видалити
      cardsToRemove.splice(indexInToRemove, 1);
      // Не додаємо в нову руку (тобто видаляємо її)
    } else {
      // Якщо ця карта не була відіграна — залишаємо її
      newHand.push(card);
    }
  }

  lobbyMembers[indexOfPlayer].hand = newHand;

  console.log("🂠 КАРТИ ПІСЛЯ ХОДУ:", newHand);
}

module.exports.removeCardsAfterMoveFromHand = removeCardsAfterMoveFromHand;
