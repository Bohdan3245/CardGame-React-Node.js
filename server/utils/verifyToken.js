const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Немає токена" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    //console.log("Токен успішно перевірений");
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Недійсний або прострочений токен." });
  }
}

module.exports.verifyToken = verifyToken;
