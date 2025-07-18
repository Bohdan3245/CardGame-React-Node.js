import { useEffect } from "react";

export const ResultOfRound = ({
  playerData,
  setPlayerData,
  myName,
  lobbyID,
  socket,
  numOfRound,
  finishGame,
  loserList,
}) => {
  //вкл викл готовності
  const handleReadyClick = () => {
    const index = playerData.findIndex((user) => user.name === myName);

    if (!playerData[index].readyStatus) {
      socket.emit("readyToStartNewRound", {
        lobbyID: lobbyID,
        readyStatus: true,
      });

      setPlayerData((prevMembers) => {
        const newStatus = [...prevMembers];
        newStatus[index].readyStatus = true;
        return newStatus;
      });

      //console.log(lobbyMembers);
    } else {
      socket.emit("readyToStartNewRound", {
        lobbyID: lobbyID,
        readyStatus: false,
      });

      setPlayerData((prevMembers) => {
        const newStatus = [...prevMembers];
        newStatus[index].readyStatus = false;
        return newStatus;
      });

      //console.log(lobbyMembers);
    }
  };

  useEffect(() => {
    socket.on("readyToStartNewRuondStatus", (data) => {
      setPlayerData(data);
    });
  });

  return (
    <div>
      <h2>Results of {numOfRound} Round</h2>
      {playerData.map((player, index) => (
        <div key={index}>
          <p
            style={{
              color: player.readyStatus ? "green" : "black",
            }}
          >
            {player.countOfGameLose}
            {player.name}: {player.points}{" "}
            {numOfRound > 1 && ` ${player.howManyPointsAdd}`}
          </p>
        </div>
      ))}

      {finishGame && (
        <div>
          <h2>{loserList.length > 1 ? "Losers" : "Loser"}</h2>
          {loserList.map((player, index) => {
            return <div key={index}> {player}</div>;
          })}
        </div>
      )}
      <button onClick={handleReadyClick}>Ready</button>
    </div>
  );
};
