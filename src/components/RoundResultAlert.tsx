import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Sparkles, Flame, Trees, Check, X, ArrowRight } from 'lucide-react';

export const RoundResultAlert: React.FC = () => {
  const { roundResultAlert, dismissResultAlert } = useGame();

  if (!roundResultAlert) return null;

  const { winningColor } = roundResultAlert;

  const winLabel =
    winningColor === 'GREEN'
      ? 'ग्रीन विन'
      : winningColor === 'RED'
      ? 'रेड विन'
      : 'ब्लू विन';

  return (
    <div
      onClick={dismissResultAlert}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      {/* Exact color-themed box directly in the front */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-xs sm:max-w-sm rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all border-4 ${
          winningColor === 'GREEN'
            ? 'bg-gradient-to-b from-green-950 via-slate-950 to-emerald-950 border-green-500 neon-glow-green-intense'
            : winningColor === 'RED'
            ? 'bg-gradient-to-b from-red-950 via-slate-950 to-rose-950 border-red-500 neon-glow-red-intense'
            : 'bg-gradient-to-b from-blue-950 via-slate-950 to-indigo-950 border-blue-500 neon-glow-blue-intense'
        }`}
      >
        {/* Ambient Top Light Beam */}
        <div
          className={`absolute -top-14 left-1/2 -translate-x-1/2 w-48 h-28 rounded-full blur-2xl pointer-events-none ${
            winningColor === 'GREEN'
              ? 'bg-green-500/50'
              : winningColor === 'RED'
              ? 'bg-red-500/50'
              : 'bg-blue-500/50'
          }`}
        />

        {/* Close icon */}
        <button
          onClick={dismissResultAlert}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900/80 border border-slate-700/80 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Winning Colored Sphere */}
        <div className="flex justify-center my-2">
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-2xl border-4 ${
              winningColor === 'GREEN'
                ? 'bg-green-500 border-green-200 text-slate-950 neon-glow-green-intense'
                : winningColor === 'RED'
                ? 'bg-red-500 border-red-200 text-white neon-glow-red-intense'
                : 'bg-blue-500 border-blue-200 text-white neon-glow-blue-intense'
            }`}
          >
            {winningColor === 'GREEN' ? (
              <Trees className="w-16 h-16 fill-current text-slate-950" />
            ) : winningColor === 'RED' ? (
              <Flame className="w-16 h-16 fill-current text-white" />
            ) : (
              <Sparkles className="w-16 h-16 fill-current text-white" />
            )}
          </div>
        </div>

        {/* Winning Text: Strictly [कलर] विन */}
        <h2
          className={`font-gaming font-black text-4xl sm:text-5xl tracking-wider uppercase my-3 ${
            winningColor === 'GREEN'
              ? 'text-green-300 drop-shadow-[0_0_25px_rgba(34,197,94,1)]'
              : winningColor === 'RED'
              ? 'text-red-300 drop-shadow-[0_0_25px_rgba(239,68,68,1)]'
              : 'text-blue-300 drop-shadow-[0_0_25px_rgba(59,130,246,1)]'
          }`}
        >
          {winLabel}
        </h2>

        {/* Simple OK / Close button */}
        <button
          onClick={dismissResultAlert}
          className={`w-full py-3 rounded-2xl font-black text-base transition-all shadow-xl active:scale-95 mt-4 ${
            winningColor === 'GREEN'
              ? 'bg-green-500 hover:bg-green-400 text-slate-950 shadow-green-500/40'
              : winningColor === 'RED'
              ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/40'
              : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/40'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );
};
