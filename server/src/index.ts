import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { seedUsers } from "./seed/seedUsers.js";
import app from "./app.js";

connectDB().then(() => seedUsers());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});