const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt"); // імпорт бібліотеки для хешування паролів
const { createToken } = require("../utils/createToken");

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

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
    });

    await newUser.save();
    //створення токена
    const token = createToken(username);
    res.status(200).json({ message: "Користувача успішно створено", token });
    console.log(
      `Користувач "\x1b[36m${username}\x1b[0m" успішно зареєструвався.`
    );
  } catch (err) {}
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
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
    const token = createToken(username);
    //console.log("токен який створивася:", token);

    res.status(200).json({ message: "Вхід успішний", token });

    console.log(`Користувач "\x1b[36m${username}\x1b[0m" увійшов в акаунт.`);
  } catch (err) {
    console.error("Помилка логіну", err.message);
    res.status(500).json({ error: "Серверна помилка" });
  }
});

module.exports = router;
