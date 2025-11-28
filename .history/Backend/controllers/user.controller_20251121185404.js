import AsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import UserService from "../services/user.service.js";

const generateToken = (user) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
});

// POST /api/users/register
const registerUser = AsyncHandler(async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  const user = await UserService.registerUser({ username, email, password, confirmPassword });
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    data: {
      user,
      token,
    },
  });
});

// POST /api/users/login
const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const userRecord = await UserService.getUserByEmail(email);
  if (!userRecord) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials.",
    });
  }

  const passwordMatch = await UserService.comparePassword(password, userRecord.password);
  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials.",
    });
  }

  const user = sanitizeUser({
    id: userRecord._id,
    username: userRecord.username,
    email: userRecord.email,
  });
  const token = generateToken(user);

  res.status(200).json({
    success: true,
    data: {
      user,
      token,
    },
  });
});

// Example: GET /api/users/:email
const getUser = AsyncHandler(async (req, res) => {
  const { email } = req.params;

  const user = await UserService.getUserByEmail(email);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});

export default { registerUser, loginUser, getUser };
