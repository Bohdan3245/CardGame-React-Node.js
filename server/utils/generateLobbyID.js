// const { customAlphabet } = require("nanoid");
// const alphabet =
//   "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// const generateLobbyID = customAlphabet(alphabet, 5);

// module.exports.generateLobbyID = generateLobbyID;
function generateLobbyID() {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    id += alphabet[randomIndex];
  }
  return id;
}

module.exports.generateLobbyID = generateLobbyID;
