const jwt = require("jsonwebtoken");

function createToken(username) {
  const token = jwt.sign(
    { username: username, role: "user" },
    process.env.JWT_SECRET,
    {
      expiresIn: "6h",
    }
  );
  // console.log(token);
  return token;
}

module.exports.createToken = createToken;
