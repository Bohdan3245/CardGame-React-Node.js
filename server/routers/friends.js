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

router.post("/findFriend", async (req, res) => {
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

router.post("/friendRequest", async (req, res) => {
  const { fromWho, toWho } = req.body;

  try {
    const result = await friendRequest(fromWho, toWho);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Error sending friend request:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/checkFriendRequest", async (req, res) => {
  const { username } = req.body;
  try {
    const result = await checkFriendRequest(username);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Error checking for friend requests:", err.message);
    return res.status(500).json({ message: "Server error" });
  }

  // const existingUser = await User.findOne({ username });
  // console.log(existingUser.friendRequest.length);
  // if (existingUser.friendRequest.length > 0) {
  //   return res.status(200).json({ friendRequest: existingUser.friendRequest });
  // } else {
  //   res.status(400);
  // }
});

router.post("/acceptDeclinReq", async (req, res) => {
  const { accOwner, friend, answer } = req.body;
  try {
    const result = await acceptDeclinRequest(accOwner, friend, answer);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Error accepting/rejecting friend request:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

router.get("/:username", async (req, res) => {
  const temp = req.params.username;
  const accOwner = { username: temp };
  try {
    const result = await getFriendList(accOwner);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Error retrieving friends list.", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/deleteFriend", async (req, res) => {
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
