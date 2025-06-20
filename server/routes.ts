import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSchema, insertPlayerSchema, insertActionSchema } from "@shared/schema";
import { z } from "zod";

const betActionSchema = z.object({
  action: z.enum(["bet", "call", "raise", "fold"]),
  amount: z.number().optional(),
});

const endGameSchema = z.object({
  winnerId: z.number(),
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

  // Make a betting action (for current player)
  app.post("/api/games/:id/actions", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const actionData = betActionSchema.parse(req.body);
      
      const game = await storage.getGame(gameId);
      const allPlayers = await storage.getPlayersByGame(gameId);
      
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      // Find current player based on turn
      const currentPlayer = allPlayers.find(p => p.position === game.currentPlayerTurn && p.status === "active");
      
      if (!currentPlayer) {
        return res.status(400).json({ error: "No active player for current turn" });
      }
      
      let amount = actionData.amount || 0;
      let newBalance = currentPlayer.balance;
      let newBet = currentPlayer.currentBet;
      let newStatus = currentPlayer.status;
      
      switch (actionData.action) {
        case "fold":
          newStatus = "folded";
          break;
          
        case "call":
          // Call the current bet amount
          const callAmount = game.currentBetAmount - currentPlayer.currentBet;
          
          if (callAmount > currentPlayer.balance) {
            return res.status(400).json({ error: "Insufficient balance to call" });
          }
          
          amount = callAmount;
          newBalance -= callAmount;
          newBet += callAmount;
          break;
          
        case "bet":
          // Only allow bet if no current bet is set (first player)
          if (game.currentBetAmount > 0) {
            return res.status(400).json({ error: "Cannot bet when there's already a bet. Use raise instead." });
          }
          
          if (amount > currentPlayer.balance) {
            return res.status(400).json({ error: "Insufficient balance" });
          }
          
          newBalance -= amount;
          newBet += amount;
          await storage.updateCurrentBetAmount(gameId, amount);
          break;
          
        case "raise":
          // Raise must be higher than current bet
          if (amount <= game.currentBetAmount) {
            return res.status(400).json({ error: `Raise must be higher than current bet of ${game.currentBetAmount}` });
          }
          
          // Calculate how much more the player needs to add
          const additionalAmount = amount - currentPlayer.currentBet;
          if (additionalAmount > currentPlayer.balance) {
            return res.status(400).json({ error: "Insufficient balance to raise" });
          }
          
          newBalance -= additionalAmount;
          newBet = amount;
          amount = additionalAmount;  // This is what gets added to the pot
          await storage.updateCurrentBetAmount(gameId, newBet);  // Update game's current bet to the new total bet amount
          break;
      }
      
      // Update player
      await storage.updatePlayerBalance(currentPlayer.id, newBalance);
      await storage.updatePlayerBet(currentPlayer.id, newBet);
      await storage.updatePlayerStatus(currentPlayer.id, newStatus);
      
      // Update pot
      if (actionData.action !== "fold") {
        await storage.updateGamePot(gameId, game.pot + amount);
      }
      
      // Record action
      await storage.createAction({
        gameId,
        handNumber: game.currentHandNumber,
        round: game.currentRound,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        action: actionData.action,
        amount: actionData.action === "fold" ? undefined : (actionData.action === "raise" ? newBet : amount),
      });
      
      // Move to next player
      const activePlayers = allPlayers.filter(p => p.status === "active");
      const currentIndex = activePlayers.findIndex(p => p.id === currentPlayer.id);
      const nextIndex = (currentIndex + 1) % activePlayers.length;
      const nextPlayer = activePlayers[nextIndex];
      
      if (nextPlayer) {
        await storage.updateCurrentPlayerTurn(gameId, nextPlayer.position);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Action processing error:", error);
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
        // Reset turn to first active player for new round
        const allPlayers = await storage.getPlayersByGame(gameId);
        const activePlayers = allPlayers.filter(p => p.status === "active");
        if (activePlayers.length > 0) {
          await storage.updateCurrentPlayerTurn(gameId, activePlayers[0].position);
        }
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

  // Declare winner (for hand)
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

  // End game with final winner
  app.post("/api/games/:id/end-game", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const { winnerId } = endGameSchema.parse(req.body);
      
      const game = await storage.getGame(gameId);
      const allPlayers = await storage.getPlayersByGame(gameId);
      const winner = allPlayers.find(p => p.id === winnerId);
      
      if (!game || !winner) {
        return res.status(404).json({ error: "Game or winner not found" });
      }
      
      // Calculate total pot from all remaining players
      const totalRemainingMoney = allPlayers.reduce((sum, p) => sum + p.balance, 0) + game.pot;
      
      // Give all money to winner
      await storage.updatePlayerBalance(winnerId, totalRemainingMoney);
      
      // Set all other players to 0
      for (const player of allPlayers) {
        if (player.id !== winnerId) {
          await storage.updatePlayerBalance(player.id, 0);
          await storage.updatePlayerStatus(player.id, "out");
        }
      }
      
      // Record game winner action
      await storage.createAction({
        gameId,
        handNumber: game.currentHandNumber,
        round: game.currentRound,
        playerId: winner.id,
        playerName: winner.name,
        action: "game_winner",
        amount: totalRemainingMoney,
      });
      
      // End the game
      await storage.endGame(gameId);
      
      res.json({ success: true, totalWon: totalRemainingMoney });
    } catch (error) {
      res.status(400).json({ error: "Failed to end game" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
