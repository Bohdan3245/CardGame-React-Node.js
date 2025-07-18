import "./css/GamePlay.css";
import { useState, useEffect, use } from "react";
import { ResultOfRound } from "./ResultOfRound";
import { Board } from "./Board";
import { getSocket } from "./socket";

export const GamePlay = ({ lobbyID, myName }) => {
  const [playersData, setPlayersData] = useState([]);
  const [myCards, setMyCards] = useState([]);
  const [whoIsMove, setWhoIsMove] = useState("");
  const [countPlayersCards, setCountPlayersCards] = useState([]);

  const [boardCards, setBoardCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState([]);
  const [cardWasPickedFromDeck, setCardWasPickedFromDeck] = useState(false);
  const [roundEnd, setRoundEnd] = useState(false);
  const [finishGame, setFinishGame] = useState(false);
  const [loserList, setLoserList] = useState([]);

  const [firstMove, setFirstMove] = useState("");
  // використовується в result of round після закінчення раунду
  const [playerData, setPlayerData] = useState([]);
  //для вісьмірок, дати по дві карти всім(на скільки хватить вісмірок), або тіки одному наступному гравцю
  const [distribute8ToAll, setDistribute8ToAll] = useState(false);

  const [jackSuit, setJackSuit] = useState("");

  const [numOfRound, setNumOfRound] = useState(0);
  const [allowToShowCards, setAllowToShowCards] = useState(false);

  const socket = getSocket();
  useEffect(() => {
    console.log(lobbyID);
    socket.emit("game");
  }, []);

  useEffect(() => {
    socket.on("setPosition", (data) => {
      console.log("data: ", data);
      let myIndex = data.indexOf(myName);
      let pose = [...data.slice(myIndex), ...data.slice(0, myIndex)];
      setPlayersData(pose);
      console.log("по ідеї першим має бути власник клієнта ", pose);
    });
    return () => {
      socket.off("setPosition");
    };
  });
  useEffect(() => {
    socket.on("getCards", (data) => {
      console.log("мої карти: ", data);
      setWhoIsMove(data.whoIsMove);
      setMyCards(data.hand);
      setBoardCards(data.board);
      setCountPlayersCards(data.countPlayersCards);
      setFirstMove(data.firstMove);
      console.log("adsadasda", data.countPlayersCards);
    });
    return () => {
      socket.off("getCards");
    };
  });

  useEffect(() => {
    socket.on("updateGameState", (data) => {
      setWhoIsMove(data.whoIsMove);
      setBoardCards(data.board);
      console.log("кількість карт при апдейті: ", data.countPlayersCards);
      setCountPlayersCards(data.countPlayersCards);
    });
    return () => {
      socket.off("updateGameState");
    };
  });

  useEffect(() => {
    socket.on("takeOneCard", (data) => {
      setMyCards(data.hand);
      if (
        boardCards.at(-1).value === "6" &&
        !data.hand.some((card) => {
          return card.suit == boardCards[boardCards.length - 1].suit;
        })
      ) {
        return console.log("тяни ще карту лошара");
      }
      //перевірка, якшо карту яку витянув з колоди не можна покласти на дошку, то гравець скіпає ход
      if (
        !data.hand.some((card) => {
          return (
            card.suit == boardCards[boardCards.length - 1].suit ||
            card.value == boardCards[boardCards.length - 1].value ||
            card.value == "J"
          );
        })
      ) {
        console.log("лошара, ти пропускаєш");
        socket.emit("skipMove", { lobbyID: lobbyID });
        setCardWasPickedFromDeck(false);
      }
    });
    return () => {
      socket.off("takeOneCard");
    };
  });

  useEffect(() => {
    socket.on("getCardsFromPlayer", (data) => {
      setMyCards(data.hand);
    });
    return () => {
      socket.off("getCardsFromPlayer");
    };
  });

  useEffect(() => {
    socket.on("endRaund", (data) => {
      setBoardCards(data.board);
      setWhoIsMove(data.whoIsMove);
      setPlayerData(data.lobbyMembers);
      setCountPlayersCards(data.countPlayersCards);
      setNumOfRound(data.numberOfRound);
      setAllowToShowCards(true);
      setFinishGame(data.finishGame);
      setLoserList(data.loserList);
      console.log("ПО ІДЄЇ НІХТО НЕ ПОВИНЕН ХОДИТИ:: ", data.whoIsMove);

      setTimeout(() => {
        setRoundEnd(data.endRaund);
        console.log("РАУНД ЗАКІНЧИВСЯ");
      }, 5000);
    });

    return () => {
      socket.off("endRaund");
    };
  });

  useEffect(() => {
    socket.on("roundRestarted", (data) => {
      setRoundEnd(data.roundStart);
      setAllowToShowCards(false);
    });
  });

  function oponentsCard(playerName, cardCountArr, playerData) {
    if (!allowToShowCards) {
      const index = cardCountArr.findIndex(
        (player) => player.name === playerName
      );
      if (index === -1) return null;
      return (
        <div className="oponentField">
          {[...Array(cardCountArr[index].cardCount)].map((_, i) => (
            <div key={i} className="oponentCard"></div>
          ))}
        </div>
      );
    } else {
      const playerIndex = playerData.findIndex(
        (user) => user.name === playerName
      );

      if (playerIndex === -1) {
        // console.error("❌ Не знайдено гравця з ім'ям:", playerName);
        return; // або return; або як тобі треба
      }

      const playerHand = playerData[playerIndex].hand;
      console.log("КАРТИ НА РУКАХ В КІНЦІ РАУНДУ: ", playerHand);
      return (
        <div className="oponentField">
          {playerHand.map((card, index) => (
            <div key={index} className="showedOponentCards">
              <div className="insideOponentCard">
                {card.value === "J" ? (
                  <p className="oponentJcardCenter">J</p>
                ) : (
                  <p
                    className="oponentCardValue1"
                    style={{ color: cardColor(card.suit) }}
                  >
                    {card.value + card.suit}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  function cardColor(suit) {
    return suit === "♦" || suit === "♥" ? "red" : "black";
  }

  return (
    <div className="mainField">
      <div className="player1">
        {/* блок поверх карт, шоб не було змоги ходити якшо не твій хід */}
        <div
          className="blockCards"
          style={{ zIndex: whoIsMove === myName ? -1 : 2 }}
        ></div>
        {/* {playersData[0]} */}
        {/* {selectedCard.length === 0 &&
        selectedCard.length === 1 ? null : selectedCard[0].value === "8" &&
          selectedCard[1].value === "8" ? (
          <div>
            <button>всі наступному</button>
            <button>по одній кожному</button>
          </div>
        ) : null} */}
        {/* ////////////////////////////////////////////////////////////////////
        {selectedCard.length === 2 &&
          selectedCard[0].value === "8" &&
          selectedCard[1].value === "8" &&
          selectedCard[2]?.value === "8" &&
          selectedCard[3]?.value === "8" && (
            <div>
              <button>всі наступному</button>
              <button>по одній кожному</button>
            </div>
          )} */}

        {/* КНОПКА СКІПА ХОДА */}

        {(() => {
          if (cardWasPickedFromDeck) {
            return (
              <div>
                <button
                  onClick={() => {
                    if (boardCards.at(-1).value === "6") {
                      return;
                    }
                    socket.emit("skipMove", { lobbyID: lobbyID });
                    setCardWasPickedFromDeck(false);
                    setFirstMove("");
                  }}
                >
                  SKIP MOVE
                </button>
              </div>
            );
          }
        })()}

        {(() => {
          //перший хід і на дошці перша карта валет, треба вибрать якусь масть

          if (
            firstMove === myName &&
            boardCards.some((card) => card.value === "J")
          ) {
            const isJ = selectedCard.some((card) => card.value === "J");
            if (isJ) {
              setFirstMove("");
              return (
                <div>
                  <button onClick={() => setJackSuit("♥")}>♥</button>
                  <button onClick={() => setJackSuit("♠")}>♠</button>
                  <button onClick={() => setJackSuit("♦")}>♦</button>
                  <button onClick={() => setJackSuit("♣")}>♣</button>
                </div>
              );
            }
            const sendJackSuit = (suit) => {
              socket.emit("firstMoveSetJackSuit", {
                lobbyID: lobbyID,
                suit: suit,
              });
              setFirstMove("");
            };
            return (
              <div>
                <button onClick={() => sendJackSuit("♥")}>♥</button>
                <button onClick={() => sendJackSuit("♠")}>♠</button>
                <button onClick={() => sendJackSuit("♦")}>♦</button>
                <button onClick={() => sendJackSuit("♣")}>♣</button>
              </div>
            );
          }

          const isJ = selectedCard.some((card) => card.value === "J");
          if (isJ) {
            return (
              <div>
                <button onClick={() => setJackSuit("♥")}>♥</button>
                <button onClick={() => setJackSuit("♠")}>♠</button>
                <button onClick={() => setJackSuit("♦")}>♦</button>
                <button onClick={() => setJackSuit("♣")}>♣</button>
              </div>
            );
          }
        })()}
        {(() => {
          const isDoubleEight =
            selectedCard.length === 2 &&
            selectedCard[0].value === "8" &&
            selectedCard[1].value === "8";
          const hasEightIn3 = selectedCard[2]?.value === "8";
          const hasEightIn4 = selectedCard[3]?.value === "8";

          const first =
            selectedCard.length === 1 &&
            selectedCard[0].value === "8" &&
            firstMove === myName;
          // це якшо перший хід почався з 8 і є ще одна вісімка яку хочеш скинути не наступному гравцю який вже отримав 8, а через нього
          if (first) {
            return (
              <div>
                <button
                  onClick={() => {
                    setDistribute8ToAll(false);
                  }}
                >
                  всі наступному
                </button>
                <button
                  onClick={() => {
                    setDistribute8ToAll(true);
                  }}
                >
                  по одній кожному
                </button>
              </div>
            );
          } else if (isDoubleEight || hasEightIn3 || hasEightIn4) {
            return (
              <div>
                <button
                  onClick={() => {
                    setDistribute8ToAll(false);
                  }}
                >
                  всі наступному
                </button>
                <button
                  onClick={() => {
                    setDistribute8ToAll(true);
                  }}
                >
                  по одній кожному
                </button>
              </div>
            );
          }

          return null;
        })()}

        <div className="player1CardsContainer">
          {myCards.map((card, index) => {
            let isSelected = selectedCard.includes(card);
            return (
              <div
                key={index}
                className={`card ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  if (whoIsMove !== myName) return;

                  setSelectedCard((prev) => {
                    const isLastSelected = prev[prev.length - 1] === card;
                    const isAlreadySelected = prev.includes(card);

                    if (isAlreadySelected) {
                      if (isLastSelected) {
                        return prev.filter((c) => c !== card);
                      } else {
                        return prev;
                      }
                    }

                    if (prev.length === 0) {
                      return [card];
                    }

                    const first = prev[0];
                    const last = prev[prev.length - 1];
                    const isSixMode = first.value === "6";
                    const isCardSix = card.value === "6";
                    const hasNonSix = prev.some((c) => c.value !== "6");

                    if (isSixMode) {
                      const isCardSix = card.value === "6";
                      const isCardJ = card.value === "J";

                      const hasJ = prev.some((c) => c.value === "J");
                      const hasNonSixNonJ = prev.some(
                        (c) => c.value !== "6" && c.value !== "J"
                      );

                      // Якщо вже є J у вибраних
                      if (hasJ) {
                        // Тоді можна додавати тільки J
                        if (isCardJ) {
                          return [...prev, card];
                        } else {
                          console.log("❌ Після J можна додавати тільки J");
                          return prev;
                        }
                      }

                      // Якщо J ще немає, діє стандартна логіка:

                      // Забороняємо додавати 6 після не-шістки
                      if (isCardSix && hasNonSixNonJ) {
                        console.log(
                          "❌ Не можна додати 6 після не-шістки (окрім J)"
                        );
                        return prev;
                      }

                      // Можна додавати 6, якщо ще не було інших карт
                      if (isCardSix) {
                        return [...prev, card];
                      }

                      const lastIsSix = last.value === "6";

                      // Дозволити додати J після 6 незалежно від масті
                      if (lastIsSix && isCardJ) {
                        return [...prev, card];
                      }

                      // Якщо остання карта — 6, можна додавати карту з такою ж мастю
                      if (lastIsSix && card.suit === last.suit) {
                        return [...prev, card];
                      }

                      // Якщо вже додано не-шістку (окрім J), дозволяємо лише карти з таким же значенням
                      if (hasNonSixNonJ) {
                        const nonSixValue = prev.find(
                          (c) => c.value !== "6" && c.value !== "J"
                        ).value;
                        return card.value === nonSixValue
                          ? [...prev, card]
                          : prev;
                      }

                      return prev;
                    } else {
                      // Звичайний режим — усі карти мають бути однакові за значенням
                      const sameValue = card.value === first.value;
                      return sameValue ? [...prev, card] : prev;
                    }
                  });
                }}
              >
                <div className="insideCard">
                  {card.value === "J" ? (
                    <>
                      {/* Центр карти */}
                      <p
                        className="JcardCenter"
                        //style={{ fontSize: "2rem", color: "black" }}
                      >
                        J
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
      </div>
      <div className="player2">
        {playersData[1]}
        {oponentsCard(playersData[1], countPlayersCards, playerData)}
      </div>
      <div className="player3">
        {playersData[2]}
        {oponentsCard(playersData[2], countPlayersCards, playerData)}
      </div>
      <div className="player4">
        {playersData[3]}
        {oponentsCard(playersData[3], countPlayersCards, playerData)}
      </div>
      <div className="playField">
        {roundEnd ? (
          <ResultOfRound
            playerData={playerData}
            setPlayerData={setPlayerData}
            myName={myName}
            lobbyID={lobbyID}
            socket={socket}
            numOfRound={numOfRound}
            finishGame={finishGame}
            loserList={loserList}
          />
        ) : (
          <Board
            myName={myName}
            boardCards={boardCards}
            setBoardCards={setBoardCards}
            selectedCard={selectedCard}
            setSelectedCard={setSelectedCard}
            socket={socket}
            setMyCards={setMyCards}
            myCards={myCards}
            cardWasPickedFromDeck={cardWasPickedFromDeck}
            setCardWasPickedFromDeck={setCardWasPickedFromDeck}
            whoIsMove={whoIsMove}
            firstMove={firstMove}
            setFirstMove={setFirstMove}
            distribute8ToAll={distribute8ToAll}
            setDistribute8ToAll={setDistribute8ToAll}
            jackSuit={jackSuit}
            setJackSuit={setJackSuit}
          />
        )}
      </div>
    </div>
  );
};
