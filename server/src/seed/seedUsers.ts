import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const seedUsers = async () => {
  const count = await User.countDocuments();

  if (count > 0) return;

  const hashed = await bcrypt.hash("123456", 10);

  await User.insertMany([
    {
      name: "Agent One",
      email: "agent1@xriseai.com",
      password: hashed,
      role: "agent",
    },
    {
      name: "Admin User",
      email: "admin@xriseai.com",
      password: hashed,
      role: "admin",
    },
  ]);

  console.log("Seeded users");
};