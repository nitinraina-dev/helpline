import User from "../models/User.js";
import type{ Request,Response } from "express";
import bcrypt from "bcryptjs";

export const getAgents = async (req:Request, res:Response) => {
  try {
    const search = String(req.query.search || "");

    const users = await User.find({
      role: "agent",
      email: { $regex: search, $options: "i" }
    })
      .select("_id name email role")
      .limit(10);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};
export const createAgent = async (req:Request, res:Response) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "agent"
    });

    res.status(201).json({
      success: true,
      message: "Agent created",
      data: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create agent"
    });
  }
};