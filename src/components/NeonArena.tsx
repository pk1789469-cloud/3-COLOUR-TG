import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { GameColor } from '../types/game';
import { Clock, Zap, Sparkles, AlertTriangle, Trophy } from 'lucide-react';

export const NeonArena: React.FC = () => {
  const { currentRound, countdown, isDrawing, lastCompletedRound, t, adminSettings, isAdmin } = useGame();

  // Cycling color state for draw animation
  const [cyclingColor, setCyclingColor] = useState<GameColor>('RED');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isDrawing) {
      const colors: GameColor[] = ['RED', 'GREEN', 'BLUE'];
      let idx = 0;
      interval = setInterval(() => {
        idx = (idx + 1) % colors.length;
        setCyclingColor(colors[idx]);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDrawing]);

  // Circumference for circular countdown timer
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (countdown / 30) * circumference;

  const isUrgent = countdown <= 5 && !isDrawing;

  const activeWinner = lastCompletedRound?.winningColor && countdown >= 12 ? lastCompletedRound.winningColor : null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-4 sm:p-6 mb-6">
      {/* Dynamic Ambient Neon Spotlights in background (ONLY winning color if won!) */}
      {activeWinner ? (
        <>
          <div
            className={`absolute -top-24 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse ${
              activeWinner === 'GREEN'
                ? 'bg-green-500/40'
                : activeWinner === 'RED'
                ? 'bg-red-500/40'
                : 'bg-blue-600/40'
            }`}
          />
          <div
            className={`absolute -bottom-24 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse ${
              activeWinner === 'GREEN'
                ? 'bg-emerald-500/35'
                : activeWinner === 'RED'
                ? 'bg-rose-500/35'
                : 'bg-cyan-500/35'
            }`}
          />
        </>
      ) : (
        <>
          <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-red-600/20 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-20 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none animate-pulse" />
        </>
      )}

      {/* Top Header Row: Period ID & Status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.period}:</span>
            <span className="font-mono-num font-bold text-sm text-white tracking-wider">
              #{currentRound.id}
            </span>
          </div>

          {/* Admin Indicator if VIP Mode is armed */}
          {isAdmin && adminSettings.outcomeMode === 'least_bet_house_wins' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-500/40">
              🛡️ VIP HOUSE EDGE
            </span>
          )}
          {isAdmin && adminSettings.outcomeMode === 'force_manual' && adminSettings.forcedNextColor && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-500/40">
              🎯 FORCED: {adminSettings.forcedNextColor}
            </span>
          )}
        </div>

        {/* Status Pill */}
        <div>
          {isDrawing ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-extrabold animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>30s समाप्त - ड्रा जारी</span>
            </div>
          ) : isUrgent ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/60 text-red-400 text-xs font-extrabold animate-bounce">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.bettingLocked}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>BETTING OPEN</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Lighting Centerpiece Stage */}
      <div className="relative z-10 py-3 sm:py-5 flex flex-col items-center justify-center">
        {/* Animated Light Arc */}
        <div className="relative flex items-center justify-center">
          {/* Circular Countdown Ring */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="5"
                fill="transparent"
              />
              {/* Progress Ring with Dynamic Glowing Color */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className={`transition-all duration-1000 ${
                  activeWinner === 'GREEN'
                    ? 'text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,1)]'
                    : activeWinner === 'RED'
                    ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)]'
                    : activeWinner === 'BLUE'
                    ? 'text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,1)]'
                    : isUrgent
                    ? 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]'
                    : 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]'
                }`}
              />
            </svg>

            {/* Central Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              {isDrawing ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl bg-amber-500/20 border-2 border-amber-400/80 animate-spin">
                    <Sparkles className="w-7 h-7 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 mt-1.5 animate-pulse">
                    ड्रा हो रहा है...
                  </span>
                </div>
              ) : activeWinner ? (
                /* When winner is active, prominently announce strictly the winning color and विन */
                <div className="flex flex-col items-center justify-center animate-fade-in">
                  <span
                    className={`font-gaming font-black text-lg sm:text-xl tracking-wider uppercase drop-shadow-md ${
                      activeWinner === 'GREEN'
                        ? 'text-green-300 drop-shadow-[0_0_12px_rgba(34,197,94,1)]'
                        : activeWinner === 'RED'
                        ? 'text-red-300 drop-shadow-[0_0_12px_rgba(239,68,68,1)]'
                        : 'text-blue-300 drop-shadow-[0_0_12px_rgba(59,130,246,1)]'
                    }`}
                  >
                    {activeWinner === 'GREEN'
                      ? 'ग्रीन विन'
                      : activeWinner === 'RED'
                      ? 'रेड विन'
                      : 'ब्लू विन'}
                  </span>
                  <span className="font-mono-num font-bold text-xs text-amber-400 mt-1">
                    00:{countdown.toString().padStart(2, '0')}
                  </span>
                </div>
              ) : (
                <>
                  <Clock className={`w-4 h-4 mb-0.5 ${isUrgent ? 'text-red-400 animate-bounce' : 'text-slate-400'}`} />
                  <span
                    className={`font-mono-num font-black text-3xl sm:text-4xl tracking-tight ${
                      isUrgent
                        ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse'
                        : 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    }`}
                  >
                    00:{countdown.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">
                    {t.countdown}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Result of Last Round Bar */}
      {lastCompletedRound && lastCompletedRound.winningColor && (
        <div className="relative z-10 mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 font-medium">अंतिम नतीजा:</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5 shadow-lg ${
                lastCompletedRound.winningColor === 'RED'
                  ? 'bg-red-950 text-red-300 border-2 border-red-500 neon-glow-red'
                  : lastCompletedRound.winningColor === 'GREEN'
                  ? 'bg-green-950 text-green-300 border-2 border-green-500 neon-glow-green'
                  : 'bg-blue-950 text-blue-300 border-2 border-blue-500 neon-glow-blue'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full animate-ping ${
                  lastCompletedRound.winningColor === 'RED'
                    ? 'bg-red-400'
                    : lastCompletedRound.winningColor === 'GREEN'
                    ? 'bg-green-400'
                    : 'bg-blue-400'
                }`}
              />
              {lastCompletedRound.winningColor === 'GREEN'
                ? 'ग्रीन विन'
                : lastCompletedRound.winningColor === 'RED'
                ? 'रेड विन'
                : 'ब्लू विन'}
            </span>

            <span className="text-[11px] font-bold text-amber-400">
              {adminSettings.multipliers[lastCompletedRound.winningColor] ?? 3.0}X PAYOUT
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
