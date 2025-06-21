import { useState } from "react";
import socket from "./socket";
export const Registration = ({ onLoginSuccess, setOwnerName }) => {
  const [activeModule, setActiveModule] = useState("registration");

  function Register({ onLoginSuccess, setOwnerName }) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [response, setResponse] = useState("");

    function checkPass() {
      if (password === tempPassword) {
        handleRegister();
      } else {
        return setResponse("паролі не співпадають");
      }
    }

    const handleRegister = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URI}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, socketId: socket.id }),
          }
        );

        const data = await res.json();
        setResponse(data.message || data.error);
        if (res.ok) {
          setOwnerName(username); // передається на головну сторінку ім'я зареєстрованого\залогованого користувача
          onLoginSuccess(); // при успішному вході\реєстрації відкриється головна сторінка
          socket.emit("socketLogin", { name: username, socketID: socket.id });
        } else {
          setResponse(data.error);
        }
      } catch (err) {
        setResponse("Сталася помилка");
      }
    };

    return (
      <div>
        <input
          type="text"
          placeholder="Ім'я користувача"
          value={username}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
        ></input>

        <input
          type="text"
          placeholder="Password"
          value={tempPassword}
          onChange={(e) => {
            setTempPassword(e.target.value);
          }}
        ></input>

        <input
          type="text"
          placeholder="Repeat Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        ></input>
        <button onClick={checkPass}>Send</button>
        <div style={{ color: "red" }}>{response}</div>
        {/* <button onClick={handleGetList}>отримати список імен</button> */}
      </div>
    );
  }

  function Login({ onLoginSuccess, setOwnerName }) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [response, setResponse] = useState("");

    const handleLogin = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URI}/api/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, socketId: socket.id }),
          }
        );

        const data = await res.json();

        setResponse(data.message || data.error);
        if (res.ok) {
          setOwnerName(username); // передається на головну сторінку ім'я зареєстрованого\залогованого користувача
          onLoginSuccess(); // при успішному вході\реєстрації відкриється головна сторінка
          socket.emit("socketLogin", { name: username, socketID: socket.id });
        } else {
          setResponse(data.error);
        }
      } catch (err) {
        setResponse(err.message);
      }
    };

    return (
      <div>
        <input
          type="text"
          placeholder="Ім'я користувача"
          value={username}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
        ></input>

        <input
          type="text"
          placeholder="Введіть пароль"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        ></input>
        <button onClick={handleLogin}>Send</button>
        <div style={{ color: "red" }}>{response}</div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <button
          onClick={() => {
            setActiveModule("registration");
          }}
        >
          Registration
        </button>
        <button
          onClick={() => {
            setActiveModule("login");
          }}
        >
          Login
        </button>
      </div>

      <div>
        {activeModule === "registration" && (
          <Register
            setOwnerName={setOwnerName}
            onLoginSuccess={onLoginSuccess}
          />
        )}
        {activeModule === "login" && (
          <Login setOwnerName={setOwnerName} onLoginSuccess={onLoginSuccess} />
        )}
      </div>
    </div>
  );
};
