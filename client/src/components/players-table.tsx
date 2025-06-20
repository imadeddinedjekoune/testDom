import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import type { GameState } from "@/lib/types";

interface PlayersTableProps {
  gameState: GameState;
  onDeclareWinner: (playerId: number) => void;
  onEndGame: (winnerId: number) => void;
}

export function PlayersTable({ gameState, onDeclareWinner, onEndGame }: PlayersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "folded":
        return "bg-red-100 text-red-800";
      case "out":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlayerColor = (position: number) => {
    const colors = ["bg-blue-600", "bg-green-600", "bg-purple-600", "bg-orange-600", "bg-pink-600", "bg-indigo-600"];
    return colors[(position - 1) % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Players</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">This Hand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hand Winner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game Winner</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gameState.players.map((player) => {
              const isCurrentTurn = player.position === gameState.game.currentPlayerTurn && player.status === "active";
              return (
                <tr key={player.id} className={`hover:bg-gray-50 ${isCurrentTurn ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 ${getPlayerColor(player.position)} rounded-full flex items-center justify-center text-white font-medium text-sm ${isCurrentTurn ? 'ring-2 ring-blue-400' : ''}`}>
                        P{player.position}
                      </div>
                      <div className="ml-3">
                        <div className={`text-sm font-medium ${isCurrentTurn ? 'text-blue-900' : 'text-gray-900'}`}>
                          {player.name}
                          {isCurrentTurn && <span className="ml-2 text-xs text-blue-600 font-semibold">TURN</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{player.balance}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{player.currentBet}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(player.status)}`}>
                      {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeclareWinner(player.id)}
                      disabled={player.status === "folded" || player.status === "out"}
                      className="text-green-600 hover:text-green-700 disabled:text-gray-400"
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      Hand
                    </Button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEndGame(player.id)}
                      disabled={player.status === "out"}
                      className="text-orange-600 hover:text-orange-700 disabled:text-gray-400"
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      Game
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
