import "./css/Main.css";
import { Header } from "./Header";
import { Lobby } from "./Lobby";
import { Profile } from "./Profile";
import { FriendsMenu } from "./FriendsMenu";
import { GamePlay } from "./GamePlay";
import { useState, useEffect } from "react";
import { getSocket } from "./socket";

export const Main = ({ ownerName }) => {
  const socket = getSocket();
  const [switchModule, setSwitchModule] = useState("");

  //    ONLINE FRIENDS STATES   //
  const [onlineStatus, setOnlineStatus] = useState([]);

  //    LOBBY STATES    //
  const [lobbyMembers, setLobbyMembers] = useState([]);
  const [isLobbyExist, setIsLobbyExist] = useState(false);
  const [lobbyID, setLobbyID] = useState("");
  const [allReady, setAllReady] = useState(false);
  const [lobbyAdmin, setLobbyAdmin] = useState(false);

  //Список учасників лоббі
  useEffect(() => {
    const handler = (data) => {
      //console.log(data, "on", socket.id);
      //console.log(data[0].lobbyID);
      setLobbyID(data[0].lobbyID);
      setLobbyMembers(data);
    };

    socket.on("lobbyMembers", handler);

    return () => {
      socket.off("lobbyMembers", handler);
    };
  }, []);

  useEffect(() => {
    socket.on("setLobbyAdmin", (data) => {
      setLobbyAdmin(data);
    });
  });

  //перевірка чи всі в лоббі готові
  useEffect(() => {
    let readyCount = 0;
    for (const obj of lobbyMembers) {
      if (obj.readyStatus) {
        readyCount++;
      }
    }
    //console.log("Кількість готових: ", readyCount);
    if (readyCount === lobbyMembers.length) {
      setAllReady(true);
    } else {
      setAllReady(false);
    }
  }, [lobbyMembers]);

  //Зміна модуля на gameplay

  useEffect(() => {
    const switchHandle = (data) => {
      console.log(data);
      setSwitchModule(data);
    };
    socket.on("switchToStartModule", switchHandle);

    return () => {
      socket.off("switchToStartModule", switchHandle);
    };
  });

  //set online status
  useEffect(() => {
    socket.on("onlineStatusOfFriend", (data) => {
      if (data.onlineStatus) {
        setOnlineStatus((prev) => [
          ...prev,
          { friendName: data.friendName, socketID: data.socketID },
        ]);
      } else {
        setOnlineStatus((prev) => {
          return prev.filter(
            (username) => username.friendName !== data.friendName
          );
        });
      }
    });

    socket.on("myOnlineFriendList", (data) => {
      setOnlineStatus(data);
    });
  }, []);

  return (
    <div className="main">
      <div className="mainHeader">
        <Header myName={ownerName} setSwitchModule={setSwitchModule} />
      </div>

      <div className="mainModule">
        {switchModule === "friends" && (
          <FriendsMenu onlineStatus={onlineStatus} myName={ownerName} />
        )}
        {switchModule === "play" && (
          <Lobby
            myName={ownerName}
            lobbyMembers={lobbyMembers}
            setLobbyMembers={setLobbyMembers}
            isLobbyExist={isLobbyExist}
            setIsLobbyExist={setIsLobbyExist}
            lobbyID={lobbyID}
            setLobbyID={setLobbyID}
            allReady={allReady}
            setLobbyAdmin={setLobbyAdmin}
            lobbyAdmin={lobbyAdmin}
            setSwitchModule={setSwitchModule}
          />
        )}
        {switchModule === "profile" && <Profile />}
      </div>
      <div>
        {switchModule === "gameplay" && (
          <GamePlay lobbyID={lobbyID} myName={ownerName} />
        )}
      </div>
    </div>
  );
};
