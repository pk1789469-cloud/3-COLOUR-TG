import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ArrowUpRight, CreditCard, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, adminSettings, createWithdrawalRequest, withdrawalRequests, t } = useGame();
  const [amount, setAmount] = useState<number>(200);
  const [upiId, setUpiId] = useState<string>(currentUser.upiId || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (amount < adminSettings.minWithdrawal) {
      setErrorMsg(`Minimum withdrawal is ₹${adminSettings.minWithdrawal}`);
      return;
    }
    if (amount > currentUser.balance) {
      setErrorMsg(`Insufficient balance. Available: ₹${currentUser.balance}`);
      return;
    }
    if (!upiId || !upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
      return;
    }

    const ok = createWithdrawalRequest(amount, upiId);
    if (ok) {
      setSuccessMsg('Withdrawal request submitted! Admin will transfer to your UPI ID shortly.');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1800);
    } else {
      setErrorMsg('Could not process withdrawal request.');
    }
  };

  const userWithdrawals = withdrawalRequests.filter((w) => w.userId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-white text-base">{t.withdraw}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Available Balance:</span>
          <span className="font-mono-num font-bold text-amber-300 text-base">
            ₹{currentUser.balance.toLocaleString('en-IN')}
          </span>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-3">
          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">
              Withdrawal Amount (₹):
            </label>
            <input
              type="number"
              required
              min={adminSettings.minWithdrawal}
              max={currentUser.balance}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Minimum: ₹{adminSettings.minWithdrawal} | Instant UPI Transfer
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">
              Your UPI ID (Payment Receiver):
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. mobile@paytm or name@oksbi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={currentUser.balance < adminSettings.minWithdrawal}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 mt-2 disabled:opacity-50"
          >
            Submit Withdrawal Request
          </button>
        </form>

        {/* Previous withdrawals */}
        {userWithdrawals.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Recent Requests</p>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {userWithdrawals.slice(0, 5).map((w) => (
                <div
                  key={w.id}
                  className="p-2 rounded-lg bg-slate-950 text-xs flex items-center justify-between"
                >
                  <span className="font-mono text-white font-bold">₹{w.amount}</span>
                  <span className="text-[10px] font-mono text-slate-400">{w.userUpiId}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      w.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-400'
                        : w.status === 'rejected'
                        ? 'bg-red-950 text-red-400'
                        : 'bg-amber-950 text-amber-400'
                    }`}
                  >
                    {w.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
