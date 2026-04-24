import type { Request, Response} from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign(
  {
    id: user._id.toString(),
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET as string,
  { expiresIn: "7d" }
);
  res.json({
    success: true,
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};