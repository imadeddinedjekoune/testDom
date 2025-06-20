import type { GameState } from "@/lib/types";

interface GameStatsProps {
  gameState: GameState;
}

export function GameStats({ gameState }: GameStatsProps) {
  const activePlayers = gameState.players.filter(p => p.status === "active").length;
  const biggestPot = Math.max(gameState.game.pot, ...gameState.actions.filter(a => a.action === "won").map(a => a.amount || 0));
  const totalRounds = ["pre-flop", "turn", "river"].indexOf(gameState.game.currentRound) + 1;

  return (
    <div className="space-y-6">
      {/* Current Hand Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Hand</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Hand Number:</span>
            <span className="font-medium">{gameState.game.currentHandNumber}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Current Round:</span>
            <span className="font-medium capitalize">{gameState.game.currentRound}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Active Players:</span>
            <span className="font-medium">{activePlayers}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Pot:</span>
            <span className="font-semibold text-green-600">{gameState.game.pot}</span>
          </div>
        </div>
      </div>

      {/* Game Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Game Stats</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Hands Played:</span>
            <span className="font-medium">{gameState.game.currentHandNumber}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Rounds:</span>
            <span className="font-medium">{totalRounds}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Biggest Pot:</span>
            <span className="font-medium">{biggestPot}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
