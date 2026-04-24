import mongoose, { Schema, Document } from "mongoose";

export interface ITicketEvent extends Document {
  ticketId: mongoose.Types.ObjectId;
  type: "created" | "reply" | "status_changed" | "reassigned";
  message: string;
  actor?: string;
}

const ticketEventSchema = new Schema<ITicketEvent>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["created", "reply", "status_changed", "reassigned"],
      required: true
    },
    message: { type: String, required: true },
    actor: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<ITicketEvent>(
  "TicketEvent",
  ticketEventSchema
);