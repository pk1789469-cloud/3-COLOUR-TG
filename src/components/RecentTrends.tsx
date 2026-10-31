import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameColor } from '../types/game';
import { History, BarChart3, HelpCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

export const RecentTrends: React.FC = () => {
  const { roundHistory, allBetsHistory, currentUser, t } = useGame();
  const [activeTab, setActiveTab] = useState<'trends' | 'my_bets' | 'rules'>('trends');

  // Calculate statistics from round history
  const totalRounds = roundHistory.length || 1;
  const redCount = roundHistory.filter((r) => r.winningColor === 'RED').length;
  const greenCount = roundHistory.filter((r) => r.winningColor === 'GREEN').length;
  const blueCount = roundHistory.filter((r) => r.winningColor === 'BLUE').length;

  const redPct = Math.round((redCount / totalRounds) * 100);
  const greenPct = Math.round((greenCount / totalRounds) * 100);
  const bluePct = Math.round((blueCount / totalRounds) * 100);

  // Current user's bets
  const userBets = allBetsHistory.filter((b) => b.userId === currentUser.id);

  return (
    <div className="w-full rounded-3xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden p-4 sm:p-6 mb-12">
      {/* Tab Header */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'trends'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t.recentHistory}</span>
        </button>

        <button
          onClick={() => setActiveTab('my_bets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my_bets'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{t.myBets} ({userBets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rules'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t.rules}</span>
        </button>
      </div>

      {/* TRENDS TAB */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          {/* Color Distribution Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
              <span>Winning Probability (Last {totalRounds} Draws)</span>
              <div className="flex gap-3">
                <span className="text-red-400">RED: {redPct}%</span>
                <span className="text-green-400">GREEN: {greenPct}%</span>
                <span className="text-blue-400">BLUE: {bluePct}%</span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden flex">
              <div style={{ width: `${redPct}%` }} className="h-full bg-red-500 neon-glow-red" />
              <div style={{ width: `${greenPct}%` }} className="h-full bg-green-500 neon-glow-green" />
              <div style={{ width: `${bluePct}%` }} className="h-full bg-blue-500 neon-glow-blue" />
            </div>
          </div>

          {/* Bead Road Display (Visual Casino History Grid) */}
          <div>
            <p className="text-xs font-bold text-slate-300 mb-2">Bead Road / Trend Line:</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              {roundHistory.slice(0, 30).map((r) => (
                <div
                  key={r.id}
                  title={`Period #${r.id} - ${r.winningColor} (${r.winningNumber})`}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-transform hover:scale-110 shadow-md ${
                    r.winningColor === 'RED'
                      ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white neon-glow-red border border-red-400/40'
                      : r.winningColor === 'GREEN'
                      ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white neon-glow-green border border-green-400/40'
                      : 'bg-gradient-to-br from-blue-600 to-cyan-700 text-white neon-glow-blue border border-blue-400/40'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {r.winningColor?.slice(0, 1)}
                  </span>
                  <span className="text-[9px] font-mono opacity-80 leading-none">
                    {r.winningNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Past Rounds Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3 font-semibold">Period</th>
                  <th className="py-2 px-3 font-semibold">Result</th>
                  <th className="py-2 px-3 font-semibold">Number</th>
                  <th className="py-2 px-3 font-semibold">Total Pool</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 font-mono">
                {roundHistory.slice(0, 8).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 text-slate-300">#{r.id}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          r.winningColor === 'RED'
                            ? 'bg-red-950 text-red-400 border border-red-500/30'
                            : r.winningColor === 'GREEN'
                            ? 'bg-green-950 text-green-400 border border-green-500/30'
                            : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {r.winningColor}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{r.winningNumber ?? '-'}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      ₹{(r.totalAmountRed + r.totalAmountGreen + r.totalAmountBlue).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MY BETS TAB */}
      {activeTab === 'my_bets' && (
        <div className="space-y-3">
          {userBets.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              You haven't placed any bets yet. Select RED, GREEN, or BLUE above!
            </div>
          ) : (
            userBets.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white ${
                      b.color === 'RED'
                        ? 'bg-red-600'
                        : b.color === 'GREEN'
                        ? 'bg-green-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    {b.color.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">Bet on {b.color}</span>
                      <span className="text-[10px] text-slate-400">({b.multiplier}X)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">Period #{b.roundId}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono-num font-bold text-white">
                    ₹{b.amount.toLocaleString('en-IN')}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'won'
                        ? 'text-emerald-400'
                        : b.status === 'lost'
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {b.status === 'won' ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>+₹{b.payout} (WON)</span>
                      </>
                    ) : b.status === 'lost' ? (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>LOST</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>PENDING</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RULES TAB */}
      {activeTab === 'rules' && (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-1">🎮 Color Prediction Rules</h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 mt-2">
              <li>
                <strong className="text-red-400">RED (लाल):</strong> If result is RED, you get{' '}
                <strong className="text-white">3.0X</strong> payout (e.g. ₹100 bet = ₹300 return).
              </li>
              <li>
                <strong className="text-green-400">GREEN (हरा):</strong> If result is GREEN, you get{' '}
                <strong className="text-white">3.0X</strong> payout (e.g. ₹100 bet = ₹300 return).
              </li>
              <li>
                <strong className="text-blue-400">BLUE (नीला):</strong> If result is BLUE, you get{' '}
                <strong className="text-white">3.0X</strong> payout (e.g. ₹100 bet = ₹300 return).
              </li>
              <li>
                <strong>Betting Window:</strong> 30 seconds per round. Betting automatically locks in the last 5 seconds.
              </li>
              <li>
                <strong>UPI Deposits:</strong> Instant QR generation with manual admin approval for 100% genuine control.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
