import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

// ─── POST /api/public/tickets/submit ────────────────────────────────────────

const validPayload = {
  name: "Alice Smith",
  email: "alice@example.com",
  subject: "Cannot login",
  body: "I have been unable to login since yesterday.",
  priority: "high",
};

describe("POST /api/public/tickets/submit", () => {
  it("creates a ticket and returns a TKT-xxxxxx id", async () => {
    const res = await request(app)
      .post("/api/public/tickets/submit")
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.ticketId).toMatch(/^TKT-\d{6}$/);
  });

  it("rejects when name is missing", async () => {
    const { name, ...rest } = validPayload;
    const res = await request(app)
      .post("/api/public/tickets/submit")
      .send(rest);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeTruthy();
  });

  it("rejects an invalid email", async () => {
    const res = await request(app)
      .post("/api/public/tickets/submit")
      .send({ ...validPayload, email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects subject shorter than 3 characters", async () => {
    const res = await request(app)
      .post("/api/public/tickets/submit")
      .send({ ...validPayload, subject: "hi" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects body shorter than 5 characters", async () => {
    const res = await request(app)
      .post("/api/public/tickets/submit")
      .send({ ...validPayload, body: "oops" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects an invalid priority value", async () => {
    const res = await request(app)
      .post("/api/public/tickets/submit")
      .send({ ...validPayload, priority: "urgent" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("stores the ticket so status-check returns it immediately", async () => {
    const submit = await request(app)
      .post("/api/public/tickets/submit")
      .send(validPayload);

    const { ticketId } = submit.body;

    const check = await request(app)
      .post("/api/public/tickets/status")
      .send({ ticketId, email: validPayload.email });

    expect(check.status).toBe(200);
    expect(check.body.data.status).toBe("open");
    expect(check.body.data.ticketId).toBe(ticketId);
  });
});
