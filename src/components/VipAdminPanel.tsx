import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameColor, PaymentRequest } from '../types/game';
import {
  Crown,
  CheckCircle,
  XCircle,
  Settings,
  Users,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Trees,
  Sparkles,
  QrCode,
  Save,
  Plus,
  Minus,
  Key,
  X,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface VipAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VipAdminPanel: React.FC<VipAdminPanelProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    isAdmin,
    loginAsAdmin,
    exitAdminMode,
    currentRound,
    countdown,
    paymentRequests,
    withdrawalRequests,
    approvePayment,
    rejectPayment,
    approveWithdrawal,
    rejectWithdrawal,
    adminSettings,
    updateAdminSettings,
    setForcedOutcome,
    allUsers,
    adjustUserBalance,
    t,
  } = useGame();

  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);
  const [activeTab, setActiveTab] = useState<'outcome' | 'payments' | 'upi_settings' | 'users'>(
    'outcome'
  );

  // Rejection modal state
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Invalid UTR number / Payment not received');

  // UPI settings form
  const [editUpiId, setEditUpiId] = useState(adminSettings.adminUpiId);
  const [editMerchantName, setEditMerchantName] = useState(adminSettings.adminMerchantName);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // User balance modal
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [balanceDelta, setBalanceDelta] = useState<number>(500);

  if (!isOpen) return null;

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAsAdmin(passcode);
    if (!success) {
      setPassError(true);
    } else {
      setPassError(false);
      setPasscode('');
    }
  };

  const handleQuickUnlock = () => {
    loginAsAdmin('SONYXGAMER');
  };

  const handleSaveUpiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminSettings({
      adminUpiId: editUpiId.trim(),
      adminMerchantName: editMerchantName.trim(),
    });
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2000);
  };

  const handleConfirmReject = () => {
    if (rejectingPaymentId) {
      rejectPayment(rejectingPaymentId, rejectReason);
      setRejectingPaymentId(null);
    }
  };

  // Pending payments count
  const pendingPayments = paymentRequests.filter((p) => p.status === 'pending');
  const pendingWithdrawals = withdrawalRequests.filter((w) => w.status === 'pending');

  // Calculate liabilities
  const redLiability = currentRound.totalAmountRed * adminSettings.multipliers.RED;
  const greenLiability = currentRound.totalAmountGreen * adminSettings.multipliers.GREEN;
  const blueLiability = currentRound.totalAmountBlue * adminSettings.multipliers.BLUE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl my-6 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden neon-glow-gold">
        {/* Modal Top Header with VIP Gold Styling */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-amber-400 text-base sm:text-lg">
                  {t.adminPanelTitle}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                  MASTER CONTROL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {t.adminSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If user is not yet authenticated as Admin, show Passcode screen */}
        {!isAdmin ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="max-w-xs mx-auto">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Key className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                {t.enterVipPass}
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Enter your secret VIP passcode to access outcome rigging and UPI approvals.
              </p>

              <form onSubmit={handleAdminAuth} className="space-y-3">
                <input
                  type="password"
                  placeholder={t.vipPassPlaceholder}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPassError(false);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-center text-amber-300 font-mono tracking-widest text-base focus:border-amber-400 focus:outline-none"
                />

                {passError && (
                  <p className="text-xs text-red-400 font-medium">
                    Incorrect Passcode. Try: SONYXGAMER or click below.
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20"
                >
                  {t.accessVip}
                </button>
              </form>

              {/* 1-Click Quick Demo Access */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-[11px] text-slate-400 mb-2">Owner Quick Access:</p>
                <button
                  onClick={handleQuickUnlock}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/30"
                >
                  ⚡ {t.demoAdminQuick} (Passcode: SONYXGAMER)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div>
            {/* VIP Tabs Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto">
              <button
                onClick={() => setActiveTab('outcome')}
                className={`flex-1 py-3 px-3 text-xs font-bold text-center border-b-2 whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'outcome'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>1. {t.nextRoundControl}</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`flex-1 py-3 px-3 text-xs font-bold text-center border-b-2 whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'payments'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>2. {t.pendingDeposits}</span>
                {pendingPayments.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
                    {pendingPayments.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('upi_settings')}
                className={`flex-1 py-3 px-3 text-xs font-bold text-center border-b-2 whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'upi_settings'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>3. {t.upiSettings}</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 px-3 text-xs font-bold text-center border-b-2 whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'users'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>4. {t.registeredUsers}</span>
              </button>
            </div>

            {/* TAB 1: OUTCOME CONTROLLER (THE VIP RIGGING ENGINE) */}
            {activeTab === 'outcome' && (
              <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Active Round Live Liability Table */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300">
                      Current Round #{currentRound.id} Liability Analysis:
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Time left: {countdown}s
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {/* RED */}
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30">
                      <p className="font-extrabold text-red-400">RED ({adminSettings.multipliers.RED}x)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Bet: ₹{currentRound.totalAmountRed}</p>
                      <p className="font-mono-num font-bold text-amber-300 text-xs mt-1">
                        Payout: ₹{redLiability}
                      </p>
                    </div>

                    {/* GREEN */}
                    <div className="p-3 rounded-xl bg-green-950/40 border border-green-500/30">
                      <p className="font-extrabold text-green-400">GREEN ({adminSettings.multipliers.GREEN}x)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Bet: ₹{currentRound.totalAmountGreen}</p>
                      <p className="font-mono-num font-bold text-amber-300 text-xs mt-1">
                        Payout: ₹{greenLiability}
                      </p>
                    </div>

                    {/* BLUE */}
                    <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30">
                      <p className="font-extrabold text-blue-400">BLUE ({adminSettings.multipliers.BLUE}x)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Bet: ₹{currentRound.totalAmountBlue}</p>
                      <p className="font-mono-num font-bold text-amber-300 text-xs mt-1">
                        Payout: ₹{blueLiability}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Outcome Mode Selector */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Select Outcome Control Mode:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Auto Fair */}
                    <button
                      onClick={() => updateAdminSettings({ outcomeMode: 'auto_fair', forcedNextColor: null })}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        adminSettings.outcomeMode === 'auto_fair'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/40 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <p className="text-xs font-bold text-white mb-0.5">🎲 {t.autoFair}</p>
                      <p className="text-[10px] text-slate-400">Standard random casino probability</p>
                    </button>

                    {/* House Edge (Zero Loss) */}
                    <button
                      onClick={() =>
                        updateAdminSettings({ outcomeMode: 'least_bet_house_wins', forcedNextColor: null })
                      }
                      className={`p-3 rounded-xl text-left border transition-all ${
                        adminSettings.outcomeMode === 'least_bet_house_wins'
                          ? 'bg-purple-600/30 border-purple-400 text-purple-200 ring-2 ring-purple-500/50 font-bold shadow-lg shadow-purple-900/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <p className="text-xs font-bold text-purple-300 mb-0.5">👑 VIP House Edge</p>
                      <p className="text-[10px] text-slate-400">
                        Picks color with least bets (Guaranteed max house profit!)
                      </p>
                    </button>

                    {/* Force Manual */}
                    <button
                      onClick={() => updateAdminSettings({ outcomeMode: 'force_manual' })}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        adminSettings.outcomeMode === 'force_manual'
                          ? 'bg-amber-600/30 border-amber-400 text-amber-200 ring-2 ring-amber-500/50 font-bold shadow-lg shadow-amber-900/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <p className="text-xs font-bold text-amber-300 mb-0.5">🎯 Manual Force</p>
                      <p className="text-[10px] text-slate-400">You select exactly which color wins next</p>
                    </button>
                  </div>
                </div>

                {/* Manual Pick Buttons */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Force Next Winner (Instant Override):
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setForcedOutcome('RED')}
                      className={`py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        adminSettings.forcedNextColor === 'RED'
                          ? 'bg-red-600 text-white ring-4 ring-red-400 neon-glow-red-intense scale-102'
                          : 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/50'
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      <span>{t.forceRed}</span>
                    </button>

                    <button
                      onClick={() => setForcedOutcome('GREEN')}
                      className={`py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        adminSettings.forcedNextColor === 'GREEN'
                          ? 'bg-green-600 text-white ring-4 ring-green-400 neon-glow-green-intense scale-102'
                          : 'bg-green-950/60 hover:bg-green-900/80 text-green-300 border border-green-700/50'
                      }`}
                    >
                      <Trees className="w-4 h-4" />
                      <span>{t.forceGreen}</span>
                    </button>

                    <button
                      onClick={() => setForcedOutcome('BLUE')}
                      className={`py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        adminSettings.forcedNextColor === 'BLUE'
                          ? 'bg-blue-600 text-white ring-4 ring-blue-400 neon-glow-blue-intense scale-102'
                          : 'bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-700/50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t.forceBlue}</span>
                    </button>
                  </div>

                  {adminSettings.forcedNextColor && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                      <span className="font-bold">
                        ⚠️ Next winner locked to: {adminSettings.forcedNextColor}
                      </span>
                      <button
                        onClick={() => setForcedOutcome(null)}
                        className="text-slate-400 hover:text-white underline text-[11px]"
                      >
                        Reset to Auto
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PENDING UPI PAYMENTS APPROVAL / REJECTION */}
            {activeTab === 'payments' && (
              <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t.pendingDeposits} ({pendingPayments.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Direct UPI approvals into user wallet
                  </span>
                </div>

                {pendingPayments.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
                    <span>{t.noPendingDeposits}</span>
                  </div>
                ) : (
                  pendingPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{p.userName}</span>
                            <span className="text-xs text-slate-400 font-mono">({p.userPhone})</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-slate-400">UTR / Ref:</span>
                            <span className="font-mono text-xs font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 select-all">
                              {p.utrNumber}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono-num font-extrabold text-lg text-emerald-400">
                            +₹{p.amount.toLocaleString('en-IN')}
                          </span>
                          <p className="text-[10px] text-slate-500">
                            {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                        {/* Approve Button */}
                        <button
                          onClick={() => approvePayment(p.id)}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.approve} (+₹{p.amount})</span>
                        </button>

                        {/* Reject Button */}
                        <button
                          onClick={() => setRejectingPaymentId(p.id)}
                          className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>{t.reject}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Processed History Summary */}
                <div className="pt-4 border-t border-slate-800">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase mb-2">
                    Recently Processed ({paymentRequests.filter((p) => p.status !== 'pending').length})
                  </h5>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {paymentRequests
                      .filter((p) => p.status !== 'pending')
                      .slice(0, 8)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-2 rounded-lg bg-slate-950/70 border border-slate-900 flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-300">{p.userName}</span>
                          <span className="font-mono text-slate-400 text-[11px]">UTR: {p.utrNumber}</span>
                          <span className="font-mono-num font-bold text-white">₹{p.amount}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              p.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-red-950 text-red-400'
                            }`}
                          >
                            {p.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ADMIN UPI & QR SETTINGS */}
            {activeTab === 'upi_settings' && (
              <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <form onSubmit={handleSaveUpiSettings} className="space-y-4">
                  {/* Active QR Preview */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
                      <img
                        src={adminSettings.customQrImageUrl || '/assets/aistudio/Screenshot_20261031-165524_02660bea.png'}
                        alt="Active QR"
                        className="w-16 h-16 object-contain rounded"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Active PhonePe / UPI QR Code</span>
                      </p>
                      <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                        {adminSettings.adminUpiId}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Shown to all players when they click Deposit (पैसे जमा करें)
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      {t.merchantUpiId} (जहाँ पैसे आने चाहिए):
                    </label>
                    <input
                      type="text"
                      required
                      value={editUpiId}
                      onChange={(e) => setEditUpiId(e.target.value)}
                      placeholder="e.g. tggamingempire@ybl"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      This UPI ID is directly embedded into the user's payment QR code.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      {t.merchantName} (मर्चेंट का नाम):
                    </label>
                    <input
                      type="text"
                      required
                      value={editMerchantName}
                      onChange={(e) => setEditMerchantName(e.target.value)}
                      placeholder="e.g. RGB Royal Club Official"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Min Deposit (₹):
                      </label>
                      <input
                        type="number"
                        value={adminSettings.minDeposit}
                        onChange={(e) => updateAdminSettings({ minDeposit: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Round Duration (Seconds):
                      </label>
                      <input
                        type="number"
                        value={adminSettings.roundDurationSeconds}
                        onChange={(e) =>
                          updateAdminSettings({ roundDurationSeconds: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  {savedSettingsNotice && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>{t.saveSettings} Successfully!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t.saveSettings}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: REGISTERED PLAYERS & BALANCE CONTROL */}
            {activeTab === 'users' && (
              <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t.registeredUsers} ({allUsers.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Direct balance adjustment
                  </span>
                </div>

                <div className="space-y-2.5">
                  {allUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{user.name}</span>
                          {user.role === 'admin' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-black">
                              ADMIN
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400">
                              PLAYER
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{user.phone}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono-num font-bold text-amber-300 text-sm">
                          ₹{user.balance.toLocaleString('en-IN')}
                        </span>

                        <div className="flex gap-1">
                          <button
                            onClick={() => adjustUserBalance(user.id, 500)}
                            className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900 text-xs font-bold"
                            title="Add ₹500"
                          >
                            +500
                          </button>
                          <button
                            onClick={() => adjustUserBalance(user.id, -500)}
                            className="p-1.5 rounded-lg bg-red-950 text-red-400 border border-red-500/40 hover:bg-red-900 text-xs font-bold"
                            title="Deduct ₹500"
                          >
                            -500
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rejection Modal Dialog */}
        {rejectingPaymentId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-red-500/40 p-5 space-y-4">
              <h4 className="font-bold text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{t.rejectModalTitle}</span>
              </h4>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  {t.rejectionReason}:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs mb-2"
                >
                  <option value="Invalid UTR number / Fake reference">Invalid UTR number / Fake reference</option>
                  <option value="Payment not received in merchant bank account">Payment not received in merchant bank account</option>
                  <option value="Amount deposited does not match request">Amount deposited does not match request</option>
                  <option value="Duplicate transaction reference already used">Duplicate transaction reference already used</option>
                </select>

                <input
                  type="text"
                  placeholder="Or custom rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setRejectingPaymentId(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  {t.confirmReject}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
