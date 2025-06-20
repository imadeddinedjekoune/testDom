import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSchema, insertPlayerSchema, insertActionSchema } from "@shared/schema";
import { z } from "zod";

const betActionSchema = z.object({
  playerId: z.number(),
  action: z.enum(["bet", "call", "raise", "fold"]),
  amount: z.number().optional(),
});

const declareWinnerSchema = z.object({
  playerId: z.number(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new game
  app.post("/api/games", async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      
      // Create players for the game
      const players = [];
      for (let i = 1; i <= gameData.playerCount; i++) {
        const player = await storage.createPlayer({
          gameId: game.id,
          name: `Player ${i}`,
          balance: gameData.startingBalance,
          position: i,
        });
        players.push(player);
      }
      
      res.json({ game, players });
    } catch (error) {
      res.status(400).json({ error: "Failed to create game" });
    }
  });

  // Get game with players
  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const players = await storage.getPlayersByGame(gameId);
      const actions = await storage.getActionsByGame(gameId);
      
      res.json({ game, players, actions });
    } catch (error) {
      res.status(500).json({ error: "Failed to get game" });
    }
  });

  // Make a betting action
  app.post("/api/games/:id/actions", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const actionData = betActionSchema.parse(req.body);
      
      const game = await storage.getGame(gameId);
      const player = (await storage.getPlayersByGame(gameId)).find(p => p.id === actionData.playerId);
      
      if (!game || !player) {
        return res.status(404).json({ error: "Game or player not found" });
      }
      
      if (player.status !== "active") {
        return res.status(400).json({ error: "Player is not active" });
      }
      
      let amount = actionData.amount || 0;
      let newBalance = player.balance;
      let newBet = player.currentBet;
      let newStatus = player.status;
      
      switch (actionData.action) {
        case "fold":
          newStatus = "folded";
          break;
          
        case "call":
          // Find the highest current bet
          const allPlayers = await storage.getPlayersByGame(gameId);
          const highestBet = Math.max(...allPlayers.map(p => p.currentBet));
          const callAmount = highestBet - player.currentBet;
          
          if (callAmount > player.balance) {
            return res.status(400).json({ error: "Insufficient balance to call" });
          }
          
          amount = callAmount;
          newBalance -= callAmount;
          newBet += callAmount;
          break;
          
        case "bet":
        case "raise":
          if (amount > player.balance) {
            return res.status(400).json({ error: "Insufficient balance" });
          }
          
          newBalance -= amount;
          newBet += amount;
          break;
      }
      
      // Update player
      await storage.updatePlayerBalance(player.id, newBalance);
      await storage.updatePlayerBet(player.id, newBet);
      await storage.updatePlayerStatus(player.id, newStatus);
      
      // Update pot
      if (actionData.action !== "fold") {
        await storage.updateGamePot(gameId, game.pot + amount);
      }
      
      // Record action
      await storage.createAction({
        gameId,
        handNumber: game.currentHandNumber,
        round: game.currentRound,
        playerId: player.id,
        playerName: player.name,
        action: actionData.action,
        amount: actionData.action === "fold" ? undefined : amount,
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to process action" });
    }
  });

  // Next round
  app.post("/api/games/:id/next-round", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      const rounds = ["pre-flop", "turn", "river"];
      const currentIndex = rounds.indexOf(game.currentRound);
      
      if (currentIndex < rounds.length - 1) {
        await storage.updateGameRound(gameId, rounds[currentIndex + 1]);
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to advance round" });
    }
  });

  // New hand
  app.post("/api/games/:id/new-hand", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      await storage.nextHand(gameId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to start new hand" });
    }
  });

  // Declare winner
  app.post("/api/games/:id/declare-winner", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const { playerId } = declareWinnerSchema.parse(req.body);
      
      const game = await storage.getGame(gameId);
      const player = (await storage.getPlayersByGame(gameId)).find(p => p.id === playerId);
      
      if (!game || !player) {
        return res.status(404).json({ error: "Game or player not found" });
      }
      
      // Give pot to winner
      await storage.updatePlayerBalance(playerId, player.balance + game.pot);
      
      // Record winner action
      await storage.createAction({
        gameId,
        handNumber: game.currentHandNumber,
        round: game.currentRound,
        playerId: player.id,
        playerName: player.name,
        action: "won",
        amount: game.pot,
      });
      
      // Start new hand
      await storage.nextHand(gameId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to declare winner" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
