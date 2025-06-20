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
  
  const callAmount = gameState.game.currentBetAmount;
  const canBet = gameState.game.currentBetAmount === 0;
  const canCall = gameState.game.currentBetAmount > 0;
  const canRaise = gameState.game.currentBetAmount > 0;

  const handleAction = (action: BetAction) => {
    if (action === "call") {
      onAction(action);
    } else if (action === "bet" || action === "raise") {
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
      
      {/* Blind Rules Info */}
      {gameState.game.currentRound === "pre-flop" && (
        <div className="mb-4 p-3 bg-amber-50 rounded-md border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Blind Rules:</strong> Big Blind (P1) bets first. Small Blind (P2) loses half the bet if folding in pre-flop.
          </p>
        </div>
      )}
      
      {/* Current Player Display */}
      <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Current Turn</p>
              <p className="text-lg font-semibold text-blue-800">
                {currentPlayer.name} (Balance: {currentPlayer.balance})
                {currentPlayer.position === 1 && (
                  <span className="ml-2 text-xs font-medium text-red-600">BIG BLIND</span>
                )}
                {currentPlayer.position === 2 && (
                  <span className="ml-2 text-xs font-medium text-yellow-600">SMALL BLIND</span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-900">Current Bet</p>
            <p className="text-xl font-bold text-blue-800">{gameState.game.currentBetAmount}</p>
            {canCall && (
              <p className="text-sm text-blue-600">Call: {callAmount}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Button
          onClick={() => handleAction("call")}
          disabled={!canCall}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
        >
          <Handshake className="h-4 w-4 mr-2" />
          Call {canCall ? `(${callAmount})` : ''}
        </Button>
        <Button
          onClick={() => handleAction("raise")}
          disabled={!canRaise}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300"
        >
          <ArrowUp className="h-4 w-4 mr-2" />
          Raise
        </Button>
        <Button
          onClick={() => handleAction("bet")}
          disabled={!canBet}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300"
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
          <div className="mb-2">
            <Label className="text-sm font-medium text-gray-700">
              {currentAction === "bet" ? "Bet Amount:" : `Raise to (minimum ${gameState.game.currentBetAmount + 1}):`}
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Input
              type="number"
              min={currentAction === "bet" ? "1" : (gameState.game.currentBetAmount + 1).toString()}
              placeholder={currentAction === "bet" ? "Enter bet amount" : `Minimum ${gameState.game.currentBetAmount + 1}`}
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="flex-1"
            />
            <Button onClick={confirmBet} className="bg-blue-600 hover:bg-blue-700">
              Confirm {currentAction === "bet" ? "Bet" : "Raise"}
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
