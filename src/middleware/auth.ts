import dotenv from "dotenv";
dotenv.config();
// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
//   console.log("Authorization header:", authHeader); // 🔹 log header

  if (!authHeader) return next(); // no token, public route

  const token = authHeader.split(" ")[1]; // Bearer TOKEN
//   console.log("Token extracted:", token); // 🔹 log extracted token
  if (!token) return next();
 
  try {
    const payload: any = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.userId = payload.userId;
    // console.log("Token payload:", payload); // 🔹 log decoded payload
  } catch (err) {
    console.log("Invalid token", err);
  }

  next();
};
