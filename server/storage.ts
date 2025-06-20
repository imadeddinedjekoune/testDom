import { games, players, actions, type Game, type Player, type Action, type InsertGame, type InsertPlayer, type InsertAction } from "@shared/schema";

export interface IStorage {
  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  updateGameRound(gameId: number, round: string): Promise<void>;
  updateGamePot(gameId: number, pot: number): Promise<void>;
  nextHand(gameId: number): Promise<void>;
  
  // Player operations
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayersByGame(gameId: number): Promise<Player[]>;
  updatePlayerBalance(playerId: number, balance: number): Promise<void>;
  updatePlayerBet(playerId: number, bet: number): Promise<void>;
  updatePlayerStatus(playerId: number, status: string): Promise<void>;
  
  // Action operations
  createAction(action: InsertAction): Promise<Action>;
  getActionsByGame(gameId: number): Promise<Action[]>;
  getActionsByHand(gameId: number, handNumber: number): Promise<Action[]>;
}

export class MemStorage implements IStorage {
  private games: Map<number, Game>;
  private players: Map<number, Player>;
  private actions: Map<number, Action>;
  private currentGameId: number;
  private currentPlayerId: number;
  private currentActionId: number;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.actions = new Map();
    this.currentGameId = 1;
    this.currentPlayerId = 1;
    this.currentActionId = 1;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    const game: Game = {
      ...insertGame,
      id,
      currentHandNumber: 1,
      currentRound: "pre-flop",
      pot: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.games.set(id, game);
    return game;
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async updateGameRound(gameId: number, round: string): Promise<void> {
    const game = this.games.get(gameId);
    if (game) {
      game.currentRound = round;
      this.games.set(gameId, game);
    }
  }

  async updateGamePot(gameId: number, pot: number): Promise<void> {
    const game = this.games.get(gameId);
    if (game) {
      game.pot = pot;
      this.games.set(gameId, game);
    }
  }

  async nextHand(gameId: number): Promise<void> {
    const game = this.games.get(gameId);
    if (game) {
      game.currentHandNumber += 1;
      game.currentRound = "pre-flop";
      game.pot = 0;
      this.games.set(gameId, game);
      
      // Reset all player bets and status
      for (const [id, player] of this.players) {
        if (player.gameId === gameId) {
          player.currentBet = 0;
          player.status = player.balance > 0 ? "active" : "out";
          this.players.set(id, player);
        }
      }
    }
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const player: Player = {
      ...insertPlayer,
      id,
      currentBet: 0,
      status: "active",
    };
    this.players.set(id, player);
    return player;
  }

  async getPlayersByGame(gameId: number): Promise<Player[]> {
    return Array.from(this.players.values())
      .filter(player => player.gameId === gameId)
      .sort((a, b) => a.position - b.position);
  }

  async updatePlayerBalance(playerId: number, balance: number): Promise<void> {
    const player = this.players.get(playerId);
    if (player) {
      player.balance = balance;
      this.players.set(playerId, player);
    }
  }

  async updatePlayerBet(playerId: number, bet: number): Promise<void> {
    const player = this.players.get(playerId);
    if (player) {
      player.currentBet = bet;
      this.players.set(playerId, player);
    }
  }

  async updatePlayerStatus(playerId: number, status: string): Promise<void> {
    const player = this.players.get(playerId);
    if (player) {
      player.status = status;
      this.players.set(playerId, player);
    }
  }

  async createAction(insertAction: InsertAction): Promise<Action> {
    const id = this.currentActionId++;
    const action: Action = {
      ...insertAction,
      id,
      timestamp: new Date(),
    };
    this.actions.set(id, action);
    return action;
  }

  async getActionsByGame(gameId: number): Promise<Action[]> {
    return Array.from(this.actions.values())
      .filter(action => action.gameId === gameId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async getActionsByHand(gameId: number, handNumber: number): Promise<Action[]> {
    return Array.from(this.actions.values())
      .filter(action => action.gameId === gameId && action.handNumber === handNumber)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }
}

export const storage = new MemStorage();
