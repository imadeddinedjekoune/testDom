import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Handshake, ArrowUp, Coins, X } from "lucide-react";
import type { GameState, BetAction } from "@/lib/types";

interface BettingActionsProps {
  gameState: GameState;
  onAction: (playerId: number, action: BetAction, amount?: number) => void;
}

export function BettingActions({ gameState, onAction }: BettingActionsProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [showBetInput, setShowBetInput] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [currentAction, setCurrentAction] = useState<BetAction>("bet");

  const activePlayers = gameState.players.filter(p => p.status === "active");

  const handleAction = (action: BetAction) => {
    if (!selectedPlayerId) return;

    if (action === "bet" || action === "raise") {
      setCurrentAction(action);
      setShowBetInput(true);
    } else {
      onAction(selectedPlayerId, action);
    }
  };

  const confirmBet = () => {
    if (!selectedPlayerId || !betAmount) return;
    
    const amount = parseInt(betAmount);
    if (amount > 0) {
      onAction(selectedPlayerId, currentAction, amount);
      setBetAmount("");
      setShowBetInput(false);
    }
  };

  const cancelBet = () => {
    setBetAmount("");
    setShowBetInput(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Betting Actions</h2>
      
      {/* Player Selection */}
      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-2">Select Player</Label>
        <Select value={selectedPlayerId?.toString() || ""} onValueChange={(value) => setSelectedPlayerId(parseInt(value))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a player" />
          </SelectTrigger>
          <SelectContent>
            {activePlayers.map((player) => (
              <SelectItem key={player.id} value={player.id.toString()}>
                {player.name} (Balance: {player.balance})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Button
          onClick={() => handleAction("call")}
          disabled={!selectedPlayerId}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Handshake className="h-4 w-4 mr-2" />
          Call
        </Button>
        <Button
          onClick={() => handleAction("raise")}
          disabled={!selectedPlayerId}
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          <ArrowUp className="h-4 w-4 mr-2" />
          Raise
        </Button>
        <Button
          onClick={() => handleAction("bet")}
          disabled={!selectedPlayerId}
          className="bg-green-500 hover:bg-green-600"
        >
          <Coins className="h-4 w-4 mr-2" />
          Bet
        </Button>
        <Button
          onClick={() => handleAction("fold")}
          disabled={!selectedPlayerId}
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
