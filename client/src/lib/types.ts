export interface GameState {
  game: {
    id: number;
    playerCount: number;
    startingBalance: number;
    currentHandNumber: number;
    currentRound: string;
    pot: number;
    isActive: boolean;
  };
  players: Array<{
    id: number;
    gameId: number;
    name: string;
    balance: number;
    currentBet: number;
    status: string;
    position: number;
  }>;
  actions: Array<{
    id: number;
    gameId: number;
    handNumber: number;
    round: string;
    playerId: number;
    playerName: string;
    action: string;
    amount?: number;
    timestamp?: Date;
  }>;
}

export type BetAction = "bet" | "call" | "raise" | "fold";
