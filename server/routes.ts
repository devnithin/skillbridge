import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertSkillSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only images allowed"));
  }
});

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

  app.post("/api/users/:id/image", upload.single("image"), async (req, res) => {
    if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.id)) {
      return res.status(403).send("Unauthorized");
    }
    if (!req.file) return res.status(400).send("No file uploaded");
    
    const imageUrl = `/uploads/${req.file.filename}`;
    const user = await storage.updateUser(parseInt(req.params.id), { imageUrl });
    res.json(user);
  });

  app.use("/uploads", express.static("uploads"));

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
        (val) => val === 'true',
        z.boolean()
      ).optional(),
    }).parse(req.query);

    const users = await storage.searchUsers(query);
    res.json(users);
  });

  const httpServer = createServer(app);
  return httpServer;
}