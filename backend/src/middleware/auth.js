import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: "Missing Bearer token." });

  if (!env.JWT_SECRET) {
    return res.status(500).json({ error: "Server JWT not configured." });
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  const user = await User.findById(payload.sub).select("-passwordHash").lean();
  if (!user) return res.status(401).json({ error: "User not found." });

  req.user = user;
  next();
});

