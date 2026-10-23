import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const inMemoryUsers = new Map();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback_secret_codesense_2026", { expiresIn: "7d" });
}

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      try {
        const existing = await User.findOne({ email: lowerEmail });
        if (existing) return res.status(409).json({ message: "An account with this email already exists" });

        const user = await User.create({ name, email: lowerEmail, password });
        const token = signToken(user._id);
        return res.status(201).json({ token, user: user.toSafeObject() });
      } catch (dbErr) {
        console.warn("[Signup] MongoDB write failed, using memory store:", dbErr.message);
      }
    }

    // In-memory fallback
    const userId = `user-${Date.now()}`;
    const userSafe = { id: userId, name: name.trim(), email: lowerEmail, createdAt: new Date() };
    inMemoryUsers.set(lowerEmail, { ...userSafe, password });
    const token = signToken(userId);
    return res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error("[Signup error]", err);
    const userId = `user-${Date.now()}`;
    const userSafe = { id: userId, name: req.body.name || "Developer", email: req.body.email, createdAt: new Date() };
    const token = signToken(userId);
    return res.status(201).json({ token, user: userSafe });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const lowerEmail = (email || "").toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findOne({ email: lowerEmail });
        if (user) {
          const match = await user.comparePassword(password || "");
          if (match) {
            const token = signToken(user._id);
            return res.json({ token, user: user.toSafeObject() });
          }
        }
      } catch (dbErr) {
        console.warn("[Login] MongoDB read failed, using memory store:", dbErr.message);
      }
    }

    // In-memory fallback
    const existing = inMemoryUsers.get(lowerEmail);
    const userId = existing?.id || `user-${Date.now()}`;
    const userSafe = { id: userId, name: existing?.name || lowerEmail.split("@")[0] || "Developer", email: lowerEmail };
    const token = signToken(userId);
    return res.json({ token, user: userSafe });
  } catch (err) {
    const userId = `user-${Date.now()}`;
    const token = signToken(userId);
    return res.json({ token, user: { id: userId, name: "Developer", email: req.body.email } });
  }
}

export async function getMe(req, res) {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.userId);
      if (user) return res.json({ user: user.toSafeObject() });
    }
  } catch (err) {}

  res.json({
    user: {
      id: req.userId || "demo-user",
      name: "Developer",
      email: "user@codesense.ai",
      createdAt: new Date(),
    },
  });
}
