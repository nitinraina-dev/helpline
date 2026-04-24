import type { Request, Response } from "express";
import Ticket from "../models/Ticket.js";
import TicketEvent from "../models/TicketEvent.js";
import User from "../models/User.js";

import type { AuthRequest } from "../middlewares/authMiddleware.js";
// ─── Helpers ────────────────────────────────────────────────────────────────

const generateTicketId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TKT-${random}`;
};

const VALID_PRIORITIES = ["low", "medium", "high"] as const;

// ─── Public: Create Ticket ───────────────────────────────────────────────────

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, body, priority } = req.body;

    // ✅ Input validation
    if (!name || !email || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: "name, email, subject, and body are required",
      });
    }

    // ✅ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // ✅ Priority validation
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `priority must be one of: ${VALID_PRIORITIES.join(", ")}`,
      });
    }

    // ✅ Trim string fields
    const sanitized = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      body: body.trim(),
      priority: priority ?? "low",
    };

    // ✅ Retry on duplicate ticketId (rare but possible)
    let ticket;
    let attempts = 0;
    while (attempts < 3) {
      try {
        ticket = await Ticket.create({
          ticketId: generateTicketId(),
          ...sanitized,
        });
        break;
      } catch (err: any) {
        if (err.code === 11000 && attempts < 2) {
          attempts++;
          continue;
        }
        throw err;
      }
    }

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticketId: ticket!.ticketId,
    });
  } catch (error) {
    console.error("[createTicket] error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create ticket. Please try again.",
    });
  }
};

// ─── Public: Check Ticket Status ────────────────────────────────────────────

export const checkTicketStatus = async (req: Request, res: Response) => {
  try {
    const { ticketId, email } = req.body;

    // ✅ Input validation
    if (!ticketId || !email) {
      return res.status(400).json({
        success: false,
        message: "ticketId and email are required",
      });
    }

    // ✅ Normalize email before querying
    const ticket = await Ticket.findOne({
      ticketId: ticketId.trim(),
      email: email.trim().toLowerCase(),
    }).lean(); // ✅ .lean() for faster read-only query

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "No ticket found with that ID and email combination",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        latestReply: ticket.latestReply ?? "",
        createdAt: ticket.createdAt,   // ✅ works now — added to ITicket
        updatedAt: ticket.updatedAt,
      },
    });
  } catch (error) {
    console.error("[checkTicketStatus] error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ticket. Please try again.",
    });
  }
};


export const getDashboardTickets = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const assignee = req.query.assignee as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    const query: any = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignedTo = assignee;

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ subject: regex }, { body: regex }];
    }

    // Role split
    if (req.user?.role === "agent") {
      query.assignedTo = req.user.id;
    }

    const tickets = await Ticket.find(query)
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments(query);

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard tickets"
    });
  }
};

export const getTicketDetail = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("assignedTo", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    if (
      req.user?.role === "agent" &&
      ticket.assignedTo?._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    const timeline = await TicketEvent.find({
      ticketId: ticket._id
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        ticket,
        timeline
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket"
    });
  }
};


export const replyTicket = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { message } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    ticket.latestReply = message;
    await ticket.save();

    await TicketEvent.create({
      ticketId: ticket._id,
      type: "reply",
      message,
      actor: req.user?.email??"unknown"
    });

    res.json({
      success: true,
      message: "Reply added"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reply"
    });
  }
};

export const updateTicketStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { status } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    ticket.status = status;
    await ticket.save();

    await TicketEvent.create({
      ticketId: ticket._id,
      type: "status_changed",
      message: `Status changed to ${status}`,
      actor: req.user?.email??"unknown"
    });

    res.json({
      success: true,
      message: "Status updated"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status"
    });
  }
};


export const reassignTicket = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { assigneeId } = req.body;

    const ticket = await Ticket.findById(
      req.params.id
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    const agent = await User.findById(
      assigneeId
    ).select("name email");

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found"
      });
    }

    ticket.assignedTo = assigneeId;
    await ticket.save();

    await TicketEvent.create({
      ticketId: ticket._id,
      type: "reassigned",
      message: `Assigned to ${agent.name} (${agent.email})`,
      actor:
        req.user?.email ?? "unknown"
    });

    res.json({
      success: true,
      message: "Ticket reassigned"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reassign"
    });
  }
};