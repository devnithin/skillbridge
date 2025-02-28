import { users, skills, type User, type InsertUser, type Skill } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, asc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { messagesTable, type Message, type InsertMessage } from "@shared/schema";

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
  getMessages(userId1: number, userId2: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getConversations(userId: number): Promise<User[]>;
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
          ].filter(Boolean) as any[]
        )
      );

    const userIds = matchingSkills.map(s => s.userId);
    if (userIds.length === 0) return [];

    return db
      .select()
      .from(users)
      .where(or(...userIds.map(id => eq(users.id, id))));
  }

  async getMessages(userId1: number, userId2: number): Promise<Message[]> {
    console.log(`Getting messages between users ${userId1} and ${userId2}`);
    const messages = await db
      .select()
      .from(messagesTable)
      .where(
        or(
          and(
            eq(messagesTable.senderId, userId1),
            eq(messagesTable.receiverId, userId2)
          ),
          and(
            eq(messagesTable.senderId, userId2),
            eq(messagesTable.receiverId, userId1)
          )
        )
      )
      .orderBy(asc(messagesTable.createdAt));

    console.log(`Found ${messages.length} messages`);
    return messages;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messagesTable).values(message).returning();
    return created;
  }

  async getConversations(userId: number): Promise<User[]> {
    console.log(`Getting conversations for user ${userId}`);

    // Using raw SQL for better control over the query
    const result = await db.execute(sql`
      WITH conversation_users AS (
        SELECT 
          other_user_id,
          MAX(created_at) as last_message_at
        FROM (
          SELECT 
            CASE
              WHEN sender_id = ${userId} THEN receiver_id
              ELSE sender_id
            END as other_user_id,
            created_at
          FROM messages
          WHERE sender_id = ${userId} OR receiver_id = ${userId}
        ) AS user_messages
        GROUP BY other_user_id
      )
      SELECT DISTINCT u.*, cu.last_message_at
      FROM users u
      INNER JOIN conversation_users cu ON u.id = cu.other_user_id
      ORDER BY cu.last_message_at DESC;
    `);

    console.log(`Found ${result.rows.length} conversations for user ${userId}`);
    // Remove the last_message_at field from the result since we only needed it for ordering
    return result.rows.map(({ last_message_at, ...user }) => user) as User[];
  }
}

export const storage = new DatabaseStorage();