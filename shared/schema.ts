import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  playerCount: integer("player_count").notNull(),
  startingBalance: integer("starting_balance").notNull(),
  currentHandNumber: integer("current_hand_number").notNull().default(1),
  currentRound: text("current_round").notNull().default("pre-flop"),
  pot: integer("pot").notNull().default(0),
  currentPlayerTurn: integer("current_player_turn").notNull().default(1),
  currentBetAmount: integer("current_bet_amount").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  name: text("name").notNull(),
  balance: integer("balance").notNull(),
  currentBet: integer("current_bet").notNull().default(0),
  status: text("status").notNull().default("active"), // active, folded, out
  position: integer("position").notNull(),
});

export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  handNumber: integer("hand_number").notNull(),
  round: text("round").notNull(),
  playerId: integer("player_id").notNull(),
  playerName: text("player_name").notNull(),
  action: text("action").notNull(), // bet, call, raise, fold
  amount: integer("amount").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).pick({
  playerCount: true,
  startingBalance: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  gameId: true,
  name: true,
  balance: true,
  position: true,
});

export const insertActionSchema = createInsertSchema(actions).pick({
  gameId: true,
  handNumber: true,
  round: true,
  playerId: true,
  playerName: true,
  action: true,
  amount: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertAction = z.infer<typeof insertActionSchema>;
export type Action = typeof actions.$inferSelect;
