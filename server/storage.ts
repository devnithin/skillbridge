import { users, skills, type User, type InsertUser, type Skill } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  getUserSkills(userId: number): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: Omit<Skill, "id">): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;
  searchUsers(query: { skill: string; category?: string; isTeaching?: boolean }): Promise<User[]>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserSkills(userId: number): Promise<Skill[]> {
    return db.select().from(skills).where(eq(skills.userId, userId));
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async createSkill(skill: Omit<Skill, "id">): Promise<Skill> {
    const [created] = await db.insert(skills).values(skill).returning();
    return created;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  async searchUsers(query: {
    skill: string;
    category?: string;
    isTeaching?: boolean;
  }): Promise<User[]> {
    const matchingSkills = await db
      .select()
      .from(skills)
      .where(
        and(
          ...[
            eq(skills.name, query.skill),
            query.category && eq(skills.category, query.category),
            typeof query.isTeaching === "boolean" &&
              eq(skills.isTeaching, query.isTeaching),
          ].filter(Boolean)
        )
      );

    const userIds = [...new Set(matchingSkills.map((s) => s.userId))];
    if (userIds.length === 0) return [];

    return db.select().from(users).where(
      // @ts-ignore - the type system doesn't understand that userIds is not empty
      userIds.map((id) => eq(users.id, id))
    );
  }
}

export const storage = new DatabaseStorage();