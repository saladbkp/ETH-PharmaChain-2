const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { loadUsers, saveUsers } = require("../models/User");

const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const users = loadUsers();

    if (users.find(user => user.username === username)) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
      username,
      password: hashedPassword,
      role
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(401).json({ message: "Username not found" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Password is incorrect" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ message: "Login successful", token, role: user.role });
};

module.exports = { register, login };
