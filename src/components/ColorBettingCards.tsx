import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameColor } from '../types/game';
import { Flame, Trees, Sparkles, Check, X, Coins, ShieldAlert } from 'lucide-react';

interface ColorBettingCardsProps {
  onOpenDeposit: () => void;
}

export const ColorBettingCards: React.FC<ColorBettingCardsProps> = ({ onOpenDeposit }) => {
  const {
    currentRound,
    countdown,
    isDrawing,
    currentUser,
    placeBet,
    adminSettings,
    lastCompletedRound,
    t,
  } = useGame();

  const [selectedColor, setSelectedColor] = useState<GameColor | null>(null);
  const [chipAmount, setChipAmount] = useState<number>(100);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isLocked = countdown <= 5 || isDrawing;

  const totalBetAmount = customAmount ? Number(customAmount) : chipAmount * multiplier;
  const targetMultiplier = selectedColor ? adminSettings.multipliers[selectedColor] : 2;
  const potentialWin = Math.floor(totalBetAmount * targetMultiplier);

  const handleOpenModal = (color: GameColor) => {
    if (isLocked) return;
    setSelectedColor(color);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleConfirmBet = () => {
    if (!selectedColor) return;
    if (totalBetAmount <= 0) {
      setErrorMsg('Please select a valid bet amount');
      return;
    }
    if (currentUser.balance < totalBetAmount) {
      setErrorMsg(`Insufficient balance (₹${currentUser.balance}). Please deposit.`);
      return;
    }

    const success = placeBet(selectedColor, totalBetAmount);
    if (success) {
      setSuccessMsg(`Bet of ₹${totalBetAmount} placed on ${selectedColor}!`);
      setTimeout(() => {
        setSelectedColor(null);
        setSuccessMsg(null);
      }, 1200);
    } else {
      setErrorMsg('Betting locked for this round.');
    }
  };

  const [forceShowAllBets, setForceShowAllBets] = useState(false);
  const [lastSeenRoundId, setLastSeenRoundId] = useState<string | null>(null);

  // Reset spotlight whenever a new completed round appears
  React.useEffect(() => {
    if (lastCompletedRound && lastCompletedRound.id !== lastSeenRoundId) {
      setLastSeenRoundId(lastCompletedRound.id);
      setForceShowAllBets(false);
    }
  }, [lastCompletedRound?.id, lastSeenRoundId]);

  // If a winner is decided and we are in celebration window (countdown >= 12), show ONLY the winning color!
  const isWinnerSpotlightActive = !!lastCompletedRound?.winningColor && countdown >= 12 && !forceShowAllBets;
  const winningColor = lastCompletedRound?.winningColor;

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {isDrawing
              ? 'नतीजा तय हो रहा है...'
              : isWinnerSpotlightActive
              ? 'राउंड का विजेता (केवल जीता हुआ कलर)'
              : t.selectColor}
          </span>
        </h2>
        <span className="text-[11px] text-slate-400 font-mono">
          Min: ₹10 | Max: ₹50,000
        </span>
      </div>

      {/* STATE 1: 30-SECOND TIMER JUST ENDED -> DRAW IN PROGRESS */}
      {isDrawing ? (
        <div className="w-full rounded-2xl p-5 border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/60 via-slate-950 to-amber-950/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-amber-400 uppercase">
                30 सेकंड का टाइम समाप्त!
              </p>
              <h3 className="text-lg sm:text-xl font-gaming font-black text-white">
                विजेता कलर तय हो रहा है...
              </h3>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            कृपया 3 सेकंड प्रतीक्षा करें
          </span>
        </div>
      ) : isWinnerSpotlightActive && winningColor ? (
        /* STATE 2: 30-SECOND TIMER ENDED & WINNER DECIDED -> STRICTLY SHOW ONLY THE WINNING COLOR */
        <div
          className={`w-full rounded-2xl p-5 sm:p-6 border-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all animate-fade-in shadow-2xl ${
            winningColor === 'GREEN'
              ? 'bg-gradient-to-r from-green-950 via-slate-950 to-emerald-950 border-green-500 neon-glow-green-intense'
              : winningColor === 'RED'
              ? 'bg-gradient-to-r from-red-950 via-slate-950 to-rose-950 border-red-500 neon-glow-red-intense'
              : 'bg-gradient-to-r from-blue-950 via-slate-950 to-indigo-950 border-blue-500 neon-glow-blue-intense'
          }`}
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            {/* Winning Color Icon */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl border-2 ${
                winningColor === 'GREEN'
                  ? 'bg-green-500 border-green-200 text-slate-950 neon-glow-green-intense'
                  : winningColor === 'RED'
                  ? 'bg-red-500 border-red-200 text-white neon-glow-red-intense'
                  : 'bg-blue-500 border-blue-200 text-white neon-glow-blue-intense'
              }`}
            >
              {winningColor === 'GREEN' ? (
                <Trees className="w-10 h-10 fill-current text-slate-950" />
              ) : winningColor === 'RED' ? (
                <Flame className="w-10 h-10 fill-current text-white" />
              ) : (
                <Sparkles className="w-10 h-10 fill-current text-white" />
              )}
            </div>

            {/* Exact User Required Format: Strictly [कलर] विन */}
            <div>
              <h3
                className={`font-gaming font-black text-3xl sm:text-4xl tracking-wider uppercase ${
                  winningColor === 'GREEN'
                    ? 'text-green-300 drop-shadow-[0_0_20px_rgba(34,197,94,1)]'
                    : winningColor === 'RED'
                    ? 'text-red-300 drop-shadow-[0_0_20px_rgba(239,68,68,1)]'
                    : 'text-blue-300 drop-shadow-[0_0_20px_rgba(59,130,246,1)]'
                }`}
              >
                {winningColor === 'GREEN'
                  ? 'ग्रीन विन'
                  : winningColor === 'RED'
                  ? 'रेड विन'
                  : 'ब्लू विन'}
              </h3>
            </div>
          </div>

          {/* Quick Action to open next round betting */}
          <button
            onClick={() => setForceShowAllBets(true)}
            className={`px-5 py-3 rounded-xl font-black text-xs whitespace-nowrap transition-all shadow-lg active:scale-95 ${
              winningColor === 'GREEN'
                ? 'bg-green-500 hover:bg-green-400 text-slate-950 shadow-green-500/30'
                : winningColor === 'RED'
                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/30'
                : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30'
            }`}
          >
            अगले राउंड के लिए दांव लगाएं ➜
          </button>
        </div>
      ) : (
        /* NORMAL 3 COLORS IN ONE SINGLE LINE FOR BETTING */
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* 1. RED BUTTON */}
          <button
            onClick={() => handleOpenModal('RED')}
            disabled={isLocked}
            className={`relative group overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center transition-all duration-200 border flex flex-col justify-between ${
              isLocked
                ? 'opacity-50 cursor-not-allowed border-red-950/40 bg-slate-950'
                : 'cursor-pointer hover:scale-102 active:scale-95 bg-gradient-to-b from-red-950/90 via-slate-900 to-red-950/70 border-red-500/60 hover:border-red-400 neon-glow-red hover:neon-glow-red-intense'
            }`}
          >
            {/* Multiplier Badge Top Right */}
            <div className="flex items-center justify-between w-full mb-1 sm:mb-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-red-500 neon-glow-red" />
              <span className="px-1.5 py-0.2 rounded text-[10px] sm:text-xs font-black font-mono bg-red-500/25 text-red-300 border border-red-500/40">
                {adminSettings.multipliers.RED}X
              </span>
            </div>

            {/* Color Icon & Title */}
            <div className="my-0.5 sm:my-1 flex flex-col items-center">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 mb-1 shadow-sm">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-red-400" />
              </div>
              <h3 className="font-gaming font-black text-sm sm:text-lg text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] leading-tight">
                {t.red}
              </h3>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                {currentRound.totalBetsRed} bets
              </span>
            </div>

            {/* Pool footer */}
            <div className="mt-1 pt-1 border-t border-red-900/40 w-full text-center">
              <span className="font-mono-num font-bold text-red-300 text-[10px] sm:text-xs block truncate">
                ₹{currentRound.totalAmountRed.toLocaleString('en-IN')}
              </span>
            </div>
          </button>

          {/* 2. GREEN BUTTON */}
          <button
            onClick={() => handleOpenModal('GREEN')}
            disabled={isLocked}
            className={`relative group overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center transition-all duration-200 border flex flex-col justify-between ${
              isLocked
                ? 'opacity-50 cursor-not-allowed border-green-950/40 bg-slate-950'
                : 'cursor-pointer hover:scale-102 active:scale-95 bg-gradient-to-b from-green-950/90 via-slate-900 to-green-950/70 border-green-500/60 hover:border-green-400 neon-glow-green hover:neon-glow-green-intense'
            }`}
          >
            {/* Multiplier Badge Top Right */}
            <div className="flex items-center justify-between w-full mb-1 sm:mb-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 neon-glow-green" />
              <span className="px-1.5 py-0.2 rounded text-[10px] sm:text-xs font-black font-mono bg-green-500/25 text-green-300 border border-green-500/40">
                {adminSettings.multipliers.GREEN}X
              </span>
            </div>

            {/* Color Icon & Title */}
            <div className="my-0.5 sm:my-1 flex flex-col items-center">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-green-600/30 border border-green-500/50 flex items-center justify-center text-green-400 mb-1 shadow-sm">
                <Trees className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-green-400" />
              </div>
              <h3 className="font-gaming font-black text-sm sm:text-lg text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] leading-tight">
                {t.green}
              </h3>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                {currentRound.totalBetsGreen} bets
              </span>
            </div>

            {/* Pool footer */}
            <div className="mt-1 pt-1 border-t border-green-900/40 w-full text-center">
              <span className="font-mono-num font-bold text-green-300 text-[10px] sm:text-xs block truncate">
                ₹{currentRound.totalAmountGreen.toLocaleString('en-IN')}
              </span>
            </div>
          </button>

          {/* 3. BLUE BUTTON */}
          <button
            onClick={() => handleOpenModal('BLUE')}
            disabled={isLocked}
            className={`relative group overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center transition-all duration-200 border flex flex-col justify-between ${
              isLocked
                ? 'opacity-50 cursor-not-allowed border-blue-950/40 bg-slate-950'
                : 'cursor-pointer hover:scale-102 active:scale-95 bg-gradient-to-b from-blue-950/90 via-slate-900 to-indigo-950/70 border-blue-500/60 hover:border-blue-400 neon-glow-blue hover:neon-glow-blue-intense'
            }`}
          >
            {/* Multiplier Badge Top Right */}
            <div className="flex items-center justify-between w-full mb-1 sm:mb-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 neon-glow-blue" />
              <span className="px-1.5 py-0.2 rounded text-[10px] sm:text-xs font-black font-mono bg-blue-500/25 text-blue-300 border border-blue-400/50 shadow-sm">
                {adminSettings.multipliers.BLUE}X
              </span>
            </div>

            {/* Color Icon & Title */}
            <div className="my-0.5 sm:my-1 flex flex-col items-center">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 mb-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-blue-400" />
              </div>
              <h3 className="font-gaming font-black text-sm sm:text-lg text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] leading-tight">
                {t.blue}
              </h3>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                {currentRound.totalBetsBlue} bets
              </span>
            </div>

            {/* Pool footer */}
            <div className="mt-1 pt-1 border-t border-blue-900/40 w-full text-center">
              <span className="font-mono-num font-bold text-blue-300 text-[10px] sm:text-xs block truncate">
                ₹{currentRound.totalAmountBlue.toLocaleString('en-IN')}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Betting Chips Modal */}
      {selectedColor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full ${
                    selectedColor === 'RED'
                      ? 'bg-red-500 neon-glow-red'
                      : selectedColor === 'GREEN'
                      ? 'bg-green-500 neon-glow-green'
                      : 'bg-blue-500 neon-glow-blue'
                  }`}
                />
                <h3 className="text-lg font-extrabold text-white">
                  Bet on {selectedColor === 'RED' ? t.red : selectedColor === 'GREEN' ? t.green : t.blue}
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-amber-300">
                  {targetMultiplier}X
                </span>
              </div>
              <button
                onClick={() => setSelectedColor(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error or Success Toast */}
            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{errorMsg}</span>
                {currentUser.balance < totalBetAmount && (
                  <button
                    onClick={() => {
                      setSelectedColor(null);
                      onOpenDeposit();
                    }}
                    className="underline font-bold text-amber-400"
                  >
                    Deposit Now
                  </button>
                )}
              </div>
            )}
            {successMsg && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Chip Selection (Casino Style) */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                {t.selectAmount} (Select Chip):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 50, 100, 500, 1000, 5000].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setChipAmount(chip);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-3 rounded-xl font-mono-num font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      chipAmount === chip && !customAmount
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-lg shadow-amber-500/30 scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>₹{chip}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Multipliers (x1, x5, x10, x20) */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Multiplier:
              </label>
              <div className="flex gap-2">
                {[1, 5, 10, 20].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMultiplier(m);
                      setCustomAmount('');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      multiplier === m && !customAmount
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    x{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                {t.customAmount}:
              </label>
              <input
                type="number"
                placeholder="Enter custom amount (e.g. 250)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Calculation Card */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="text-slate-400 font-medium">Total Bet Amount:</p>
                <p className="text-white font-mono-num font-bold text-base mt-0.5">
                  ₹{totalBetAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-medium">Potential Win:</p>
                <p className="text-emerald-400 font-mono-num font-bold text-base mt-0.5">
                  ₹{potentialWin.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setSelectedColor(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmBet}
                disabled={isLocked}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all ${
                  selectedColor === 'RED'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30'
                    : selectedColor === 'GREEN'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-600/30'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-600/30'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{t.confirmBet}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
