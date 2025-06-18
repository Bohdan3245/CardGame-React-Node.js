const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt"); // імпорт бібліотеки для хешування паролів

router.post("/register", async (req, res) => {
  const { username, password, socketId } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "І'мя та пароль обов'язвкові" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Користувач вже існує" });
    }
    //хешуєм пароль
    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPass,
      socketID: socketId,
    });

    await newUser.save();
    res.status(200).json({ message: "Користувача успішно створено" });
    console.log(
      `Користувач "\x1b[36m${username}\x1b[0m" успішно зареєструвався.`
    );
  } catch (err) {}
});

router.post("/login", async (req, res) => {
  const { username, password, socketId } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      res.status(400).json({ error: "користувача не знайдено" });
    }

    //порівняння паролю з клієнта і з бд
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Невірний пароль" });
    }
    res.status(200).json({ message: "Вхід успішний" });
    await User.updateOne(
      { username: username },
      { $set: { socketID: socketId } }
    );
    console.log(
      `Користувач "\x1b[36m${username}\x1b[0m" увійшов в акаунт. socket.id: ${socketId}`
    );
  } catch (err) {
    console.error("Помилка логіну", err.message);
    res.status(500).json({ error: "Серверна помилка" });
  }
});

module.exports = router;
