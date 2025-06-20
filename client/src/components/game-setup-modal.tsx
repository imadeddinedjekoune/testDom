import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface GameSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartGame: (playerCount: number, startingBalance: number) => void;
}

export function GameSetupModal({ open, onOpenChange, onStartGame }: GameSetupModalProps) {
  const [playerCount, setPlayerCount] = useState(3);
  const [startingBalance, setStartingBalance] = useState(100);

  const handleStartGame = () => {
    onStartGame(playerCount, startingBalance);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Setup New Game</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="playerCount" className="text-sm font-medium text-gray-700">
              Number of Players
            </Label>
            <Select value={playerCount.toString()} onValueChange={(value) => setPlayerCount(parseInt(value))}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Players</SelectItem>
                <SelectItem value="4">4 Players</SelectItem>
                <SelectItem value="5">5 Players</SelectItem>
                <SelectItem value="6">6 Players</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="startingBalance" className="text-sm font-medium text-gray-700">
              Starting Balance
            </Label>
            <Input
              id="startingBalance"
              type="number"
              value={startingBalance}
              onChange={(e) => setStartingBalance(parseInt(e.target.value) || 100)}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">Units per player</p>
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <Button onClick={handleStartGame} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Start Game
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
