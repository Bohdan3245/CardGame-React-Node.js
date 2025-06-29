import { getSocket } from "./socket";
import { useState, useEffect } from "react";

export const FriendsMenu = ({ myName, onlineStatus }) => {
  const socket = getSocket();
  const token = sessionStorage.getItem("token");

  const [frBlock, setFrBlock] = useState("");
  const [frRequetList, setFrRequestList] = useState({ friendRequest: [] });

  //Список друзів
  const [friendList, setFriendList] = useState([]);

  const getFriendList = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URI}/api/friends/${myName}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        console.log("шось пішло не так");
      }
      const data = await res.json();

      setFriendList(data.friendList);

      console.log("те шо прийшло на сервер", data.friendList);
    } catch (err) {}
  };

  function ListFr({ friendList, setFriendList, onlineStatus }) {
    const [hovered, setHovered] = useState();
    const [openMenuIndex, setOpenMenuIndex] = useState(null);

    const deletFriend = async (name) => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URI}/api/friends/deleteFriend`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, myName }),
          }
        );
        console.log(`${name} and ${myName} go to the server`); // true

        const data = await res.json();
        if (res.ok) {
          const a = friendList.filter((username) => username !== name);
          setFriendList(a); //////////////////////////////////////
        }
      } catch (err) {}
    };

    return (
      <div>
        <h2>Friend List</h2>
        <div>
          {friendList.map((name, index) => (
            <div
              className="friendMember"
              key={index}
              onMouseEnter={() => {
                setHovered(index);
              }}
              onMouseLeave={() => {
                setHovered(-1);
              }}
            >
              <p
                style={{
                  color: onlineStatus.some(
                    (friend) => friend.friendName === name
                  )
                    ? "green"
                    : "black",
                }}
              >
                {index + 1}. {name}{" "}
                {onlineStatus.some((friend) => friend.friendName === name)
                  ? "online"
                  : "offline"}
              </p>
              {hovered === index && (
                <button
                  onClick={() => {
                    setOpenMenuIndex(index);
                    setHovered(-1);
                  }}
                >
                  menu
                </button>
              )}
              {openMenuIndex === index && (
                <div
                  onMouseLeave={() => {
                    setOpenMenuIndex(-1);
                  }}
                >
                  <button onClick={() => alert("Перегляд профілю")}>
                    Профіль
                  </button>
                  <button onClick={() => deletFriend(name)}>Видалити</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  //Пошук друзів
  function FindFr() {
    const [inputValue, setInputValue] = useState("");
    const [username, setName] = useState("");
    const [response, setResponse] = useState("");
    const [findStatus, setFindStatus] = useState(false);
    const [buttonState, setButtonState] = useState();
    const [searchResult, setSearchResult] = useState("");

    useEffect(() => {
      if (username) {
        handleFindFr();
      }
    }, [username]);

    const handleFindFr = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URI}/api/friends/findFriend`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, myName }),
          }
        );

        const data = await res.json();
        if (res.ok) {
          setFindStatus(true);
        } else {
          setResponse(data.error);
        }

        setResponse(data.message || data.error || data.button);
        setButtonState(data.button);
        setSearchResult(data.username);
      } catch (err) {
        setResponse(err);
      }
    };

    const sendRequest = () => {
      const friendRequest = async () => {
        try {
          const res = await fetch(
            `${process.env.REACT_APP_SERVER_URI}/api/friends/friendRequest`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ fromWho: myName, toWho: username }), // я тут зупинився
            }
          );

          const data = await res.json();
          setResponse(data.message);
        } catch (err) {
          console.log(err.message);
        }
      };

      return (
        <div>
          <p>Результат пошуку: </p>
          {searchResult}
          <button
            style={buttonState ? null : { display: "none" }}
            onClick={friendRequest}
          >
            Надіслати заявку
          </button>
        </div>
      );
    };

    return (
      <div>
        <h2>Find Friend</h2>
        <input
          type="text"
          placeholder="Name of user"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        ></input>
        <button
          onClick={() => {
            setName(inputValue);
            setResponse("");
          }}
        >
          Find
        </button>
        <div style={{ color: "red" }}>{response}</div>
        {findStatus === true && sendRequest()}
      </div>
    );
  }

  //Запити на додавання в друзі
  useEffect(() => {
    socket.emit("checkFriendRequest", { username: myName });

    socket.on("friendRequestList", (data) => {
      setFrRequestList(data || { friendRequest: [] });
    });
    socket.on("friendRequestUpdated", (data) => {
      if (data.username === myName) {
        setFrRequestList({ friendRequest: data.friendRequest });
        console.log("шо приходить з сервера: ", data);
      }
    });

    return () => {
      socket.off("friendRequestList");
      socket.off("friendRequestUpdated");
    };
  }, [myName]);

  function RequestFr() {
    const acceptDeclineReq = async (frName, answer) => {
      //console.log(`User ${myName} add ${frName} to friend List ${answer}`);

      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URI}/api/friends/acceptDeclinReq`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accOwner: myName,
              friend: frName,
              answer: answer,
            }),
          }
        );

        const data = await res.json();
        //console.log(data.message);
      } catch (err) {
        console.log(err.message);
      }
    };

    return (
      <div>
        <div>
          <h2>Friend Request</h2>
        </div>
        <div>
          {frRequetList.friendRequest.map((name, index) => (
            <div key={index}>
              <p>
                {index + 1}. {name}
              </p>
              <button
                onClick={() => {
                  acceptDeclineReq(name, true);
                  //Видалення імені зі списку при підтверджені запиту на дружбу
                  const updateList = {
                    ...frRequetList,
                    friendRequest: frRequetList.friendRequest.filter(
                      (username) => username !== name
                    ),
                  };
                  setFrRequestList(updateList);
                  /////////////////////////////////////////////////////////////
                }}
              >
                Accept
              </button>
              <button
                onClick={() => {
                  acceptDeclineReq(name, false);
                  //Видалення імені зі списку при відхилинні запиту на дружбу
                  const updateList = {
                    ...frRequetList,
                    friendRequest: frRequetList.friendRequest.filter(
                      (username) => username !== name
                    ),
                  };
                  setFrRequestList(updateList);
                  /////////////////////////////////////////////////////////////
                }}
              >
                Decline
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>FRIENDS MENU</div>
      <div>
        <button
          onClick={() => {
            setFrBlock("list");
            getFriendList();
          }}
        >
          Friend List
        </button>
        <button
          onClick={() => {
            setFrBlock("find");
          }}
        >
          Find Friend
        </button>
        <button
          onClick={() => {
            setFrBlock("request");
          }}
        >
          Friend Request{" "}
          {frRequetList.friendRequest.length === 0
            ? null
            : `+${frRequetList.friendRequest.length}`}
        </button>
      </div>
      <div>
        {frBlock === "list" && (
          <ListFr
            friendList={friendList}
            setFriendList={setFriendList}
            onlineStatus={onlineStatus}
          />
        )}
        {frBlock === "find" && <FindFr />}
        {frBlock === "request" && <RequestFr />}
      </div>
    </div>
  );
};
