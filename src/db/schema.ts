import { pgTable, serial, text, doublePrecision, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
});

export const edges = pgTable("edges", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").notNull(),
  targetId: integer("target_id").notNull(),
  weight: doublePrecision("weight").notNull(),
});

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt"),
});

// --- Use Case Tables ---

export const simulations = pgTable("simulations", {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => user.id),
    name: text("name").notNull(), // e.g., "Monday Morning Deliveries"
    nodeCount: integer("nodeCount").notNull(),
    edgeCount: integer("edgeCount").notNull(),
    algorithmUsed: text("algorithmUsed").notNull(), // e.g., "Fibonacci-Dijkstra"
    executionTimeMs: doublePrecision("executionTimeMs").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
});

export const routes = pgTable("routes", {
    id: text("id").primaryKey(),
    simulationId: text("simulationId").notNull().references(() => simulations.id),
    startNode: integer("startNode").notNull(),
    endNode: integer("endNode").notNull(),
    path: text("path").notNull(), // JSON string of the node IDs
    totalWeight: doublePrecision("totalWeight").notNull(),
});
