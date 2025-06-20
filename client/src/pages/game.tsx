import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GameSetupModal } from "@/components/game-setup-modal";
import { PlayersTable } from "@/components/players-table";
import { BettingActions } from "@/components/betting-actions";
import { ActionHistory } from "@/components/action-history";
import { GameStats } from "@/components/game-stats";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Forward, RotateCcw, Undo } from "lucide-react";
import type { GameState, BetAction } from "@/lib/types";

export default function Game() {
  const [gameId, setGameId] = useState<number | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gameState, isLoading } = useQuery<GameState>({
    queryKey: [`/api/games/${gameId}`],
    enabled: !!gameId,
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  const createGameMutation = useMutation({
    mutationFn: async ({ playerCount, startingBalance }: { playerCount: number; startingBalance: number }) => {
      const response = await apiRequest("POST", "/api/games", { playerCount, startingBalance });
      return response.json();
    },
    onSuccess: (data) => {
      setGameId(data.game.id);
      toast({ title: "Game created successfully!" });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${data.game.id}`] });
    },
    onError: () => {
      toast({ title: "Failed to create game", variant: "destructive" });
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action, amount }: { action: BetAction; amount?: number }) => {
      await apiRequest("POST", `/api/games/${gameId}/actions`, { action, amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Action failed", variant: "destructive" });
    },
  });

  const nextRoundMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/games/${gameId}/next-round`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      toast({ title: "Advanced to next round" });
    },
  });

  const newHandMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/games/${gameId}/new-hand`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      toast({ title: "Started new hand" });
    },
  });

  const declareWinnerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      await apiRequest("POST", `/api/games/${gameId}/declare-winner`, { playerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      toast({ title: "Winner declared! New hand started." });
    },
  });

  const endGameMutation = useMutation({
    mutationFn: async (winnerId: number) => {
      await apiRequest("POST", `/api/games/${gameId}/end-game`, { winnerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      toast({ title: "Game ended! Winner takes all." });
    },
  });

  const handleStartGame = (playerCount: number, startingBalance: number) => {
    createGameMutation.mutate({ playerCount, startingBalance });
  };

  const handleAction = (action: BetAction, amount?: number) => {
    actionMutation.mutate({ action, amount });
  };

  const handleDeclareWinner = (playerId: number) => {
    declareWinnerMutation.mutate(playerId);
  };

  const handleEndGame = (winnerId: number) => {
    endGameMutation.mutate(winnerId);
  };

  const handleNewGame = () => {
    setGameId(null);
    setShowSetup(true);
  };

  const handleResetGame = () => {
    if (confirm("Are you sure you want to reset the game?")) {
      setGameId(null);
      setShowSetup(true);
    }
  };

  // Show setup modal if no game
  useEffect(() => {
    if (!gameId) {
      setShowSetup(true);
    }
  }, [gameId]);

  if (!gameId || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GameSetupModal
          open={showSetup}
          onOpenChange={setShowSetup}
          onStartGame={handleStartGame}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Domino Hold'em</h1>
            <p className="text-gray-600">Setting up your game...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎲</div>
              <h1 className="text-xl font-bold text-gray-900">Domino Hold'em</h1>
              <span className="text-sm text-gray-500 font-medium">Bet Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hand #{gameState?.game.currentHandNumber}
              </span>
              <Button variant="outline" onClick={handleNewGame} className="bg-gray-100 hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                New Game
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Game Status & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Pot Display */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Pot</h2>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {gameState?.game.pot || 0}
                </div>
                <div className="text-sm text-gray-500">
                  Round: <span className="font-medium capitalize">{gameState?.game.currentRound}</span>
                </div>
              </div>
            </div>

            {/* Players Table */}
            <PlayersTable gameState={gameState!} onDeclareWinner={handleDeclareWinner} onEndGame={handleEndGame} />

            {/* Betting Actions */}
            <BettingActions gameState={gameState!} onAction={handleAction} />

            {/* Round Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Round Management</h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => nextRoundMutation.mutate()}
                  disabled={nextRoundMutation.isPending}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Forward className="h-4 w-4 mr-2" />
                  Next Round
                </Button>
                <Button
                  onClick={() => newHandMutation.mutate()}
                  disabled={newHandMutation.isPending}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Hand
                </Button>
                <Button
                  onClick={handleResetGame}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Undo className="h-4 w-4 mr-2" />
                  Reset Game
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Game History */}
          <div className="space-y-6">
            <GameStats gameState={gameState!} />
            <ActionHistory gameState={gameState!} />
          </div>
        </div>
      </div>

      <GameSetupModal
        open={showSetup}
        onOpenChange={setShowSetup}
        onStartGame={handleStartGame}
      />
    </div>
  );
}
