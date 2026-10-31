/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { NeonArena } from './components/NeonArena';
import { ColorBettingCards } from './components/ColorBettingCards';
import { RecentTrends } from './components/RecentTrends';
import { UpiDepositModal } from './components/UpiDepositModal';
import { VipAdminPanel } from './components/VipAdminPanel';
import { AuthModal } from './components/AuthModal';
import { WithdrawModal } from './components/WithdrawModal';
import { RoundResultAlert } from './components/RoundResultAlert';
import { SettingsModal } from './components/SettingsModal';
import { Settings, PlusCircle, ArrowUpRight } from 'lucide-react';

const MainGameContent: React.FC = () => {
  const { isAdmin, paymentRequests, t } = useGame();

  const [depositOpen, setDepositOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const pendingCount = paymentRequests.filter((p) => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col relative selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenDeposit={() => setDepositOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthOpen(true);
        }}
        onOpenWithdraw={() => setWithdrawOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Admin notification only shown if owner is actively authenticated */}
      {isAdmin && pendingCount > 0 && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>
              VIP Alert: <strong>{pendingCount} new UPI payment request(s)</strong> waiting for approval!
            </span>
          </div>
          <button
            onClick={() => setAdminOpen(true)}
            className="px-3 py-1 bg-slate-950 text-amber-300 rounded-lg text-xs font-black hover:bg-slate-900 transition-all"
          >
            Review & Approve Now
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-5">
        {/* Neon Arena Stage */}
        <NeonArena />

        {/* 3 Color Betting Cards (RED, GREEN, BLUE) */}
        <ColorBettingCards onOpenDeposit={() => setDepositOpen(true)} />

        {/* Trends, Road Map & Betting History */}
        <RecentTrends />
      </main>

      {/* Floating Bottom Quick Action Bar */}
      <div className="sticky bottom-0 z-30 w-full glass-panel border-t border-slate-800 bg-slate-950/90 backdrop-blur-lg py-2.5 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setDepositOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>{t.deposit}</span>
          </button>

          <button
            onClick={() => setWithdrawOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
            <span>{t.withdraw}</span>
          </button>

          {/* Settings Button (VIP Admin is securely moved inside Settings) */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>{t.settings}</span>
          </button>
        </div>
      </div>

      {/* Settings Modal (Language, Sound & Secret VIP Admin Owner Control) */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenAdminPanel={() => setAdminOpen(true)}
      />

      {/* Modals */}
      <UpiDepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
      />

      <VipAdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
      />

      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />

      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
      />

      {/* Front-and-Center Winning Color Announcement Box */}
      <RoundResultAlert />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainGameContent />
    </GameProvider>
  );
}
