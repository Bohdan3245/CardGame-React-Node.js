import { useState, useEffect } from "react";
import { getSocket } from "./socket";

export const Lobby = ({
  myName,
  lobbyMembers,
  setLobbyMembers,
  isLobbyExist,
  setIsLobbyExist,
  lobbyID,
  setLobbyID,
  allReady,
  lobbyAdmin,
  setLobbyAdmin,
  setSwitchModule,
}) => {
  const socket = getSocket();
  const [createJoinHandler, setCreateJoinHandler] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [joinIsVisible, setJoinIsVisible] = useState(true);
  const [lobbyIsVisible, setLobbyIsVisible] = useState(true);

  const LobbyMembers = () => {
    const copyText = () => {
      navigator.clipboard
        .writeText(lobbyID)
        .then(() => {
          console.log("Текст скопійовано:", lobbyID);
        })
        .catch((err) => {
          console.error("Помилка копіювання:", err);
        });
    };

    //вкл викл готовності
    const handleReadyClick = () => {
      const index = lobbyMembers.findIndex((user) => user.name === myName);

      if (!lobbyMembers[index].readyStatus) {
        socket.emit("readyToStart", {
          lobbyID: lobbyID,
          readyStatus: true,
          name: myName,
        });

        setLobbyMembers((prevMembers) => {
          const newStatus = [...prevMembers];
          newStatus[index].readyStatus = true;
          return newStatus;
        });

        //console.log(lobbyMembers);
      } else {
        socket.emit("readyToStart", {
          lobbyID: lobbyID,
          readyStatus: false,
          name: myName,
        });

        setLobbyMembers((prevMembers) => {
          const newStatus = [...prevMembers];
          newStatus[index].readyStatus = false;
          return newStatus;
        });

        //console.log(lobbyMembers);
      }
    };

    return (
      <div>
        {lobbyIsVisible && (
          <div>
            <div>
              lobby #
              <span style={{ cursor: "pointer" }} onClick={copyText}>
                {lobbyID}
              </span>
            </div>
            <div>
              <h2>Members</h2>
              <div>
                {lobbyMembers.map((user, index) => {
                  return (
                    <div key={index}>
                      <p
                        style={{
                          color: user.readyStatus ? "green" : "black",
                        }}
                      >
                        {index + 1}. {user.name}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div>
                <button onClick={handleReadyClick}>Ready</button>
                <button
                  onClick={() => {
                    socket.emit("leaveLobby", {
                      lobbyID: lobbyID,
                      name: myName,
                    });

                    setLobbyMembers([]);
                    setIsVisible(true);
                    setLobbyIsVisible(false);
                    setIsLobbyExist(false);
                    setLobbyAdmin("");
                  }}
                >
                  Leave
                </button>
                {/* <button
                  onClick={() =>
                    console.log(
                      `чи всі готові: ${allReady} чи я адмін: ${lobbyAdmin}`
                    )
                  }
                >
                  allready status
                </button> */}
              </div>
              {allReady && lobbyAdmin === myName && (
                <div>
                  <button
                    onClick={() => {
                      socket.emit("startGame", {
                        lobbyID: lobbyID,
                        command: "gameplay",
                      });
                      setSwitchModule("gameplay");
                    }}
                  >
                    Start
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const JoinLobby = () => {
    const [response, setResponse] = useState("");

    useEffect(() => {
      socket.on("response", (data) => {
        setResponse(data.message);
        if (data.message === "ok") {
          setCreateJoinHandler("lobby");
          setJoinIsVisible(false);
          setIsLobbyExist(true);
        }
      });
    }, []);

    function handleJoinClick() {
      const input = document.getElementById("roomID-input");
      const value = input.value;
      socket.emit("joinLobby", {
        lobbyID: value,
        name: myName,
      });
      setLobbyID(value);
      input.value = "";
    }

    return (
      <div>
        {joinIsVisible && (
          <div>
            <input
              id="roomID-input"
              type="text"
              placeholder="Enter ID of room"
            ></input>
            <button onClick={handleJoinClick}>join</button>
          </div>
        )}
        {response}
      </div>
    );
  };

  return (
    <div>
      {isLobbyExist && lobbyID ? (
        <LobbyMembers />
      ) : (
        isVisible && (
          <div>
            <button
              onClick={() => {
                socket.emit("createLobby", { name: myName });
                setCreateJoinHandler("lobby");
                setIsVisible(false);
                setLobbyIsVisible(true);
                setIsLobbyExist(true);
                setLobbyAdmin(myName);
              }}
            >
              Create Lobby
            </button>
            <button
              onClick={() => {
                setCreateJoinHandler("join");
                setIsVisible(false);
                setLobbyIsVisible(true);
                setJoinIsVisible(true);
              }}
            >
              Join Lobby
            </button>
          </div>
        )
      )}
      <div>{createJoinHandler === "join" && <JoinLobby />}</div>
    </div>
  );
};
