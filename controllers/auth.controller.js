const jwt = require("jsonwebtoken");
const users = require("../models/users.json");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const login = (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);

    if (!user || user.login.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.login.md5, email: user.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




module.exports = { login };

