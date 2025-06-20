import type { GameState } from "@/lib/types";

interface ActionHistoryProps {
  gameState: GameState;
}

export function ActionHistory({ gameState }: ActionHistoryProps) {
  const formatAction = (action: any) => {
    switch (action.action) {
      case "bet":
        return `bet ${action.amount}`;
      case "call":
        return `called ${action.amount}`;
      case "raise":
        return `raised to ${action.amount}`;
      case "fold":
        return "folded";
      case "won":
        return `won pot (${action.amount})`;
      default:
        return action.action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "fold":
        return "text-red-600";
      case "won":
        return "text-green-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Action History</h2>
      </div>
      <div className="p-6">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {gameState.actions.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No actions yet</p>
          ) : (
            gameState.actions.map((action) => (
              <div key={action.id} className="flex items-start space-x-3 text-sm">
                <div className="flex-shrink-0 w-16 text-xs text-gray-500 font-medium capitalize">
                  {action.round}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{action.playerName}</span>
                  {" "}
                  <span className={getActionColor(action.action)}>
                    {formatAction(action)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
