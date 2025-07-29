export const Board = ({
  myName,
  boardCards,
  setBoardCards,
  selectedCard,
  setSelectedCard,
  socket,
  setMyCards,
  myCards,
  cardWasPickedFromDeck,
  setCardWasPickedFromDeck,
  whoIsMove,
  firstMove,
  setFirstMove,
  distribute8ToAll,
  setDistribute8ToAll,
  jackSuit,
  setJackSuit,
  lobbyID,
}) => {
  function cardColor(suit) {
    return suit === "♦" || suit === "♥" ? "red" : "black";
  }
  return (
    <div>
      <div className="board">
        {boardCards.map((card, index) => {
          return (
            <div
              key={index}
              className="card-on-board"
              onClick={() => {
                console.log("я нажався саааам");

                if (!selectedCard[0]) return;

                const boardTopCard = boardCards.at(-1); // остання карта на дошці
                const selectedTopCard = selectedCard[0];

                if (!boardTopCard) return console.log("На дошці ще нема карти");

                const boardSuit = boardTopCard.suit;
                const boardValue = boardTopCard.value;
                const selectedValue = selectedTopCard.value;
                const selectedSuit = selectedTopCard.suit;

                if (firstMove === myName) {
                  console.log(">> ПЕРШИЙ ХІД <<");

                  if (boardValue === "6") {
                    if (
                      selectedSuit === boardSuit ||
                      selectedValue === boardValue
                    ) {
                      //перевірка чи вибрали масть для вальта

                      console.log("✅ Можна класти карту");

                      socket.emit("playerMove", {
                        lobbyID: lobbyID,
                        move: selectedCard,
                        whoMoved: myName,
                        conditionFor8: distribute8ToAll,
                        firstMoveCard: "",
                        jackSuit: jackSuit,
                      });

                      setBoardCards((prev) =>
                        [...prev, ...selectedCard].slice(-4)
                      );

                      setMyCards((prev) =>
                        prev.filter((c) => !selectedCard.includes(c))
                      );

                      setSelectedCard([]);
                      setCardWasPickedFromDeck(false);
                      setJackSuit("");
                      setFirstMove("");
                    }
                  }

                  if (boardValue === "7" && selectedValue === "7") {
                    console.log("✅ Можна класти 7");

                    socket.emit("playerMove", {
                      lobbyID: lobbyID,
                      move: selectedCard,
                      whoMoved: myName,
                      conditionFor8: distribute8ToAll,
                      firstMoveCard: "",
                      jackSuit: jackSuit,
                    });

                    setBoardCards((prev) =>
                      [...prev, ...selectedCard].slice(-4)
                    );

                    setMyCards((prev) =>
                      prev.filter((c) => !selectedCard.includes(c))
                    );

                    setSelectedCard([]);
                    setFirstMove("");
                    setCardWasPickedFromDeck(false);
                  } else if (boardValue === "8" && selectedValue === "8") {
                    socket.emit("playerMove", {
                      lobbyID: lobbyID,
                      move: selectedCard,
                      whoMoved: myName,
                      conditionFor8: distribute8ToAll,
                      firstMoveCard: boardValue,
                      jackSuit: jackSuit,
                    });

                    setBoardCards((prev) =>
                      [...prev, ...selectedCard].slice(-4)
                    );

                    setMyCards((prev) =>
                      prev.filter((c) => !selectedCard.includes(c))
                    );

                    setSelectedCard([]);
                    setFirstMove("");
                    setCardWasPickedFromDeck(false);
                    setDistribute8ToAll(false);
                  } else if (boardValue === "A" && selectedValue === "A") {
                    socket.emit("playerMove", {
                      lobbyID: lobbyID,
                      move: selectedCard,
                      whoMoved: myName,
                      conditionFor8: distribute8ToAll,
                      firstMoveCard: boardValue,
                      jackSuit: jackSuit,
                    });

                    setBoardCards((prev) =>
                      [...prev, ...selectedCard].slice(-4)
                    );

                    setMyCards((prev) =>
                      prev.filter((c) => !selectedCard.includes(c))
                    );

                    setSelectedCard([]);
                    setFirstMove("");
                    setCardWasPickedFromDeck(false);
                    setDistribute8ToAll(false);
                  } else if (
                    boardValue === "J" &&
                    selectedValue === "J" &&
                    jackSuit !== ""
                  ) {
                    socket.emit("playerMove", {
                      lobbyID: lobbyID,
                      move: selectedCard,
                      whoMoved: myName,
                      conditionFor8: distribute8ToAll,
                      firstMoveCard: "",
                      jackSuit: jackSuit,
                    });
                    console.log("ВАЛЕТ ВІДПРАВИВСЯ В ПЕРШІЙ ІФЦІ");
                    setBoardCards((prev) =>
                      [...prev, ...selectedCard].slice(-4)
                    );

                    setMyCards((prev) =>
                      prev.filter((c) => !selectedCard.includes(c))
                    );

                    setSelectedCard([]);
                    setCardWasPickedFromDeck(false);
                    setJackSuit("");
                    setFirstMove("");
                    return;
                  } else if (boardValue === selectedValue) {
                    socket.emit("playerMove", {
                      lobbyID: lobbyID,
                      move: selectedCard,
                      whoMoved: myName,
                      conditionFor8: distribute8ToAll,
                      firstMoveCard: "",
                      jackSuit: jackSuit,
                    });
                    console.log("ВАЛЕТ ВІДПРАВИВСЯ В ПЕРШІЙ ІФЦІ");
                    setBoardCards((prev) =>
                      [...prev, ...selectedCard].slice(-4)
                    );

                    setMyCards((prev) =>
                      prev.filter((c) => !selectedCard.includes(c))
                    );

                    setSelectedCard([]);
                    setCardWasPickedFromDeck(false);
                    setJackSuit("");
                    setFirstMove("");
                  } else {
                    console.log("❌ Першим ходом можна класти тільки 7");
                  }

                  return; // зупинити тут, далі код не піде
                }

                // --- Не перший хід ---
                if (
                  selectedCard.some((card) => card.value === "6") &&
                  selectedCard.some((card) => card.value === "J")
                ) {
                  if (jackSuit !== "") {
                    socket.emit("playerMove", {
                      lobbyID: lobbyID,
                      move: selectedCard,
                      whoMoved: myName,
                      conditionFor8: distribute8ToAll,
                      firstMoveCard: "",
                      jackSuit: jackSuit,
                    });

                    setBoardCards((prev) =>
                      [...prev, ...selectedCard].slice(-4)
                    );

                    setMyCards((prev) =>
                      prev.filter((c) => !selectedCard.includes(c))
                    );

                    setSelectedCard([]);
                    setCardWasPickedFromDeck(false);
                    setJackSuit("");
                    setFirstMove("");
                  }
                  return;
                }
                // boardCards.length != 1 тут для перевірки, якшо це початок раунда, і на дошці тіки одна карта, то вальта не можна буде скинути за звичайних умов
                if (selectedValue === "J" && jackSuit !== "") {
                  socket.emit("playerMove", {
                    lobbyID: lobbyID,
                    move: selectedCard,
                    whoMoved: myName,
                    conditionFor8: distribute8ToAll,
                    firstMoveCard: "",
                    jackSuit: jackSuit,
                  });
                  console.log("ВАЛЕТ ВІДПРАВИВСЯ В ПЕРШІЙ ІФЦІ");
                  setBoardCards((prev) => [...prev, ...selectedCard].slice(-4));

                  setMyCards((prev) =>
                    prev.filter((c) => !selectedCard.includes(c))
                  );

                  setSelectedCard([]);
                  setCardWasPickedFromDeck(false);
                  setJackSuit("");
                  setFirstMove("");
                  return;
                }
                if (selectedValue === "J" && jackSuit === "") {
                  console.log("❌ Спочатку обери масть для валета");
                  return;
                }
                if (
                  selectedSuit === boardSuit ||
                  selectedValue === boardValue
                ) {
                  //перевірка чи вибрали масть для вальта

                  console.log("✅ Можна класти карту");

                  socket.emit("playerMove", {
                    lobbyID: lobbyID,
                    move: selectedCard,
                    whoMoved: myName,
                    conditionFor8: distribute8ToAll,
                    firstMoveCard: "",
                    jackSuit: jackSuit,
                  });

                  setBoardCards((prev) => [...prev, ...selectedCard].slice(-4));

                  setMyCards((prev) =>
                    prev.filter((c) => !selectedCard.includes(c))
                  );

                  setSelectedCard([]);
                  setCardWasPickedFromDeck(false);
                  setJackSuit("");
                  setFirstMove("");
                } else {
                  console.log("❌ Не можна класти цю карту", firstMove);
                }
              }}
            >
              <div className="insideCard">
                {card.value === "J" ? (
                  <>
                    {/* Верхній лівий кут */}
                    <p
                      className="JcardSuit1"
                      style={{ color: cardColor(card.suit) }}
                    >
                      {card.suit}
                      {/* {jackSuit ? `${jackSuit}` : ""} */}
                    </p>

                    {/* Центр карти */}
                    <p
                      className="JcardCenter"
                      //style={{ fontSize: "2rem", color: "black" }}
                    >
                      J
                    </p>

                    {/* Нижній правий кут */}
                    <p
                      className="JcardSuit2"
                      style={{ color: cardColor(card.suit) }}
                    >
                      {card.suit}
                      {/* {jackSuit ? `${jackSuit}` : ""} */}
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="cardValue1"
                      style={{ color: cardColor(card.suit) }}
                    >
                      {card.value + card.suit}
                    </p>
                    <p
                      className="cardValue2"
                      style={{ color: cardColor(card.suit) }}
                    >
                      {card.value + card.suit}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="deck"
        onClick={() => {
          if (firstMove === myName && boardCards.at(-1).value === "J") {
            return;
          }
          if (selectedCard.length > 0) {
            setSelectedCard([]);
          }
          const checkMovePossibility = myCards.some((card) => {
            return card.suit == boardCards[boardCards.length - 1].suit;
          });

          if (
            whoIsMove === myName &&
            boardCards.at(-1).value === "6" &&
            !checkMovePossibility
          ) {
            console.log("спрацював ця іфка для шестірки");
            socket.emit("getOneCard", { name: myName, lobbyID: lobbyID });
          } else {
            if (whoIsMove === myName && !cardWasPickedFromDeck) {
              socket.emit("getOneCard", { name: myName, lobbyID: lobbyID });
              setCardWasPickedFromDeck(true);
            }
          }
        }}
      >
        колода
      </div>
    </div>
  );
};
