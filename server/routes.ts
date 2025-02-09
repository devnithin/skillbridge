import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertSkillSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

type WebSocketWithUser = WebSocket & { userId?: number };
const connections = new Map<number, WebSocketWithUser>();

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get user profile
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  });

  // Update user profile
  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.id)) {
      return res.status(403).send("Unauthorized");
    }
    const user = await storage.updateUser(parseInt(req.params.id), req.body);
    res.json(user);
  });

  // Get user skills
  app.get("/api/users/:id/skills", async (req, res) => {
    const skills = await storage.getUserSkills(parseInt(req.params.id));
    res.json(skills);
  });

  // Add skill
  app.post("/api/skills", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(403).send("Unauthorized");

    const parsed = insertSkillSchema.parse(req.body);
    const skill = await storage.createSkill({
      ...parsed,
      userId: req.user.id,
    });
    res.status(201).json(skill);
  });

  // Delete skill
  app.delete("/api/skills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(403).send("Unauthorized");

    const skill = await storage.getSkill(parseInt(req.params.id));
    if (!skill) return res.status(404).send("Skill not found");
    if (skill.userId !== req.user.id) return res.status(403).send("Unauthorized");

    await storage.deleteSkill(parseInt(req.params.id));
    res.sendStatus(204);
  });

  // Search users by skill
  app.get("/api/search", async (req, res) => {
    const query = z.object({
      skill: z.string(),
      category: z.string().optional(),
      isTeaching: z.preprocess(
        // Convert string 'true'/'false' to boolean
        (val) => val === 'true',
        z.boolean()
      ).optional(),
    }).parse(req.query);

    const users = await storage.searchUsers(query);
    res.json(users);
  });

  // Add message routes
  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(403).send("Unauthorized");
    const messages = await storage.getMessages(req.user.id, parseInt(req.params.userId));
    res.json(messages);
  });

  // Get conversations
  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(403).send("Unauthorized");
    const conversations = await storage.getConversations(req.user.id);
    res.json(conversations);
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocketWithUser) => {
    console.log("New WebSocket connection established");

    ws.on("message", async (data: string) => {
      try {
        const message = JSON.parse(data);
        console.log("Received WebSocket message:", message.type);

        if (message.type === "auth") {
          // Close any existing connections for this user
          const existingConnection = connections.get(message.userId);
          if (existingConnection) {
            console.log(`Closing existing connection for user ${message.userId}`);
            existingConnection.close();
          }

          ws.userId = message.userId;
          connections.set(message.userId, ws);
          console.log(`User ${message.userId} authenticated via WebSocket`);

          // Send confirmation
          ws.send(JSON.stringify({ type: "auth_success" }));
          return;
        }

        if (!ws.userId) {
          console.error("Unauthenticated WebSocket message:", message);
          ws.send(JSON.stringify({ 
            type: "error", 
            message: "Not authenticated" 
          }));
          return;
        }

        if (message.type === "message") {
          const parsedMessage = insertMessageSchema.parse({
            senderId: ws.userId,
            receiverId: message.receiverId,
            content: message.content,
          });

          const savedMessage = await storage.createMessage(parsedMessage);
          console.log(`Message saved: ${savedMessage.id} from ${savedMessage.senderId} to ${savedMessage.receiverId}`);

          // Send to receiver if online
          const receiverWs = connections.get(message.receiverId);
          if (receiverWs?.readyState === WebSocket.OPEN) {
            console.log(`Sending message to receiver ${message.receiverId}`);
            receiverWs.send(JSON.stringify({
              type: "message",
              message: savedMessage,
            }));
          } else {
            console.log(`Receiver ${message.receiverId} is not connected`);
          }

          // Send confirmation to sender
          ws.send(JSON.stringify({
            type: "message_sent",
            message: savedMessage,
          }));
        }
      } catch (err) {
        const error = err as Error;
        console.error("WebSocket error:", error);
        ws.send(JSON.stringify({ 
          type: "error", 
          message: error.message 
        }));
      }
    });

    ws.on("close", () => {
      if (ws.userId) {
        console.log(`User ${ws.userId} WebSocket connection closed`);
        // Only remove the connection if it's the same instance
        if (connections.get(ws.userId) === ws) {
          connections.delete(ws.userId);
        }
      }
    });

    // Send periodic ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on("close", () => clearInterval(pingInterval));
  });

  return httpServer;
}