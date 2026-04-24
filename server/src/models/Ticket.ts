import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "closed";
  assignedTo?: mongoose.Types.ObjectId;
  latestReply?: string;
  createdAt: Date;   
  updatedAt: Date; 
}

const ticketSchema = new Schema<ITicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
      index: true
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "closed"],
      default: "open",
      index: true
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    latestReply: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

ticketSchema.index({ subject: "text", body: "text" });

export default mongoose.model<ITicket>("Ticket", ticketSchema);