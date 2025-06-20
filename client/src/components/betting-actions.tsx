import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Handshake, ArrowUp, Coins, X, User } from "lucide-react";
import type { GameState, BetAction } from "@/lib/types";

interface BettingActionsProps {
  gameState: GameState;
  onAction: (action: BetAction, amount?: number) => void;
}

export function BettingActions({ gameState, onAction }: BettingActionsProps) {
  const [showBetInput, setShowBetInput] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [currentAction, setCurrentAction] = useState<BetAction>("bet");

  const currentPlayer = gameState.players.find(p => p.position === gameState.game.currentPlayerTurn && p.status === "active");

  const handleAction = (action: BetAction) => {
    if (action === "bet" || action === "raise") {
      setCurrentAction(action);
      setShowBetInput(true);
    } else {
      onAction(action);
    }
  };

  const confirmBet = () => {
    if (!betAmount) return;
    
    const amount = parseInt(betAmount);
    if (amount > 0) {
      onAction(currentAction, amount);
      setBetAmount("");
      setShowBetInput(false);
    }
  };

  const cancelBet = () => {
    setBetAmount("");
    setShowBetInput(false);
  };

  if (!currentPlayer) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Betting Actions</h2>
        <p className="text-gray-500 text-center">No active players remaining</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Betting Actions</h2>
      
      {/* Current Player Display */}
      <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
        <div className="flex items-center space-x-3">
          <User className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Current Turn</p>
            <p className="text-lg font-semibold text-blue-800">
              {currentPlayer.name} (Balance: {currentPlayer.balance})
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Button
          onClick={() => handleAction("call")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Handshake className="h-4 w-4 mr-2" />
          Call
        </Button>
        <Button
          onClick={() => handleAction("raise")}
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          <ArrowUp className="h-4 w-4 mr-2" />
          Raise
        </Button>
        <Button
          onClick={() => handleAction("bet")}
          className="bg-green-500 hover:bg-green-600"
        >
          <Coins className="h-4 w-4 mr-2" />
          Bet
        </Button>
        <Button
          onClick={() => handleAction("fold")}
          className="bg-red-600 hover:bg-red-700"
        >
          <X className="h-4 w-4 mr-2" />
          Fold
        </Button>
      </div>

      {/* Bet Amount Input */}
      {showBetInput && (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center space-x-3">
            <Label className="text-sm font-medium text-gray-700">Amount:</Label>
            <Input
              type="number"
              min="1"
              placeholder="Enter bet amount"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="flex-1"
            />
            <Button onClick={confirmBet} className="bg-blue-600 hover:bg-blue-700">
              Confirm
            </Button>
            <Button variant="outline" onClick={cancelBet}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
