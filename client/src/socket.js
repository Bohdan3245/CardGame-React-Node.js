import { io } from "socket.io-client";
//const socket = io("http://localhost:3001");

let socket;

export const connectSocket = (token) => {
  socket = io(process.env.REACT_APP_SERVER_URI, {
    auth: {
      token,
    },
  });

  socket.on("connect", () => {
    console.log("Підключено до сокету:", socket.id);
  });
};

// export default socket;
export const getSocket = () => socket;
