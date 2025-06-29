const express = require("express");
const router = express.Router();
const {
  findFriend,
  friendRequest,
  checkFriendRequest,
  acceptDeclinRequest,
  getFriendList,
  removeFriend,
} = require("../controllers/friendController");
const { verifyToken } = require("../utils/verifyToken");

router.post("/findFriend", verifyToken, async (req, res) => {
  const { username, myName } = req.body;
  //console.log("отримано ім'я для пошуку: ", username);

  try {
    const result = await findFriend(username, myName);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Friend search error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post("/friendRequest", verifyToken, async (req, res) => {
  const { fromWho, toWho } = req.body;

  try {
    const result = await friendRequest(fromWho, toWho);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Error sending friend request:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/acceptDeclinReq", verifyToken, async (req, res) => {
  const { accOwner, friend, answer } = req.body;
  try {
    const result = await acceptDeclinRequest(accOwner, friend, answer);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Error accepting/rejecting friend request:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

router.get("/:username", verifyToken, async (req, res) => {
  //console.log(req.headers.authorization);
  const accOwner = { username: req.params.username };
  try {
    const result = await getFriendList(accOwner);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Error retrieving friends list.", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/deleteFriend", verifyToken, async (req, res) => {
  const { name, myName } = req.body;

  try {
    const result = await removeFriend(name, myName);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Error removing user:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
