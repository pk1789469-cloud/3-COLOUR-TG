import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useGame } from '../context/GameContext';
import {
  QrCode,
  Copy,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  X,
  CreditCard,
  Zap,
} from 'lucide-react';

interface UpiDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpiDepositModal: React.FC<UpiDepositModalProps> = ({ isOpen, onClose }) => {
  const {
    adminSettings,
    currentUser,
    createPaymentRequest,
    paymentRequests,
    t,
  } = useGame();

  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedUtrHelp, setCopiedUtrHelp] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');

  const finalAmount = customAmount ? Number(customAmount) : amount;

  // Generate QR code whenever amount or admin UPI changes
  useEffect(() => {
    if (!adminSettings.adminUpiId) return;
    const upiUri = `upi://pay?pa=${adminSettings.adminUpiId}&pn=${encodeURIComponent(
      adminSettings.adminMerchantName
    )}&am=${finalAmount}&cu=INR&tn=RGBRoyal_${currentUser.phone || 'Player'}`;

    QRCode.toDataURL(upiUri, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [finalAmount, adminSettings.adminUpiId, adminSettings.adminMerchantName, currentUser.phone]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(adminSettings.adminUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (finalAmount < adminSettings.minDeposit) {
      setErrorMsg(`Minimum deposit amount is ₹${adminSettings.minDeposit}`);
      return;
    }
    if (finalAmount > adminSettings.maxDeposit) {
      setErrorMsg(`Maximum deposit amount is ₹${adminSettings.maxDeposit}`);
      return;
    }
    if (!utrNumber || utrNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid 12-digit UTR / UPI Ref ID number');
      return;
    }

    const success = createPaymentRequest(finalAmount, utrNumber);
    if (success) {
      setSubmittedSuccess(true);
      setUtrNumber('');
      setTimeout(() => {
        setSubmittedSuccess(false);
        setActiveTab('history');
      }, 1500);
    } else {
      setErrorMsg('Failed to submit deposit. Please check details.');
    }
  };

  // User's own payment requests
  const userPayments = paymentRequests.filter((p) => p.userId === currentUser.id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg my-6 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                {t.upiDepositTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                100% Direct UPI Transfer to Admin Bank
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

        {/* Tab switch: Deposit vs History */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === 'deposit'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. {t.deposit}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>2. Status / History</span>
            {userPayments.some((p) => p.status === 'pending') && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>

        {activeTab === 'deposit' ? (
          <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
            {/* Amount Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                1. {t.selectAmount}:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-mono-num font-bold transition-all ${
                      amount === amt && !customAmount
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 shadow-md shadow-emerald-500/30 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mt-2.5">
                <input
                  type="number"
                  placeholder="Or enter custom amount (Min ₹100)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* QR Code & Admin UPI Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{t.scanQrToPay} (₹{finalAmount})</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-500/40">
                  PhonePe / All UPI
                </span>
              </div>

              {/* QR Image Box */}
              <div className="relative p-2.5 bg-white rounded-2xl shadow-xl border-2 border-emerald-500/30 overflow-hidden">
                <img
                  src={adminSettings.customQrImageUrl || qrDataUrl}
                  alt="Official UPI Payment QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                />
              </div>

              <p className="text-[11px] font-medium text-slate-300 mt-2.5">
                Scan with <strong className="text-purple-400">PhonePe</strong>, <strong className="text-blue-400">Google Pay</strong>, <strong className="text-cyan-400">Paytm</strong>, or any UPI App
              </p>

              {/* Official UPI ID Copy Card */}
              <div className="mt-3 w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    {t.ourUpiId}:
                  </p>
                  <p className="font-mono text-xs sm:text-sm font-black text-emerald-300 select-all tracking-wide">
                    {adminSettings.adminUpiId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 transition-all shadow-md active:scale-95"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.copyUpi}</span>
                    </>
                  )}
                </button>
              </div>

              {/* DIRECT PHONEPE AUTO-PAY BUTTON (1-Click Open PhonePe with Pre-filled Amount) */}
              <div className="mt-4 w-full space-y-2">
                <a
                  href={`phonepe://pay?pa=${adminSettings.adminUpiId}&pn=${encodeURIComponent(adminSettings.adminMerchantName)}&am=${finalAmount}&cu=INR&tn=TG_Gaming_Deposit`}
                  onClick={(e) => {
                    // Try PhonePe specific intent, fallback to generic UPI intent
                    const standardUpi = `upi://pay?pa=${adminSettings.adminUpiId}&pn=${encodeURIComponent(adminSettings.adminMerchantName)}&am=${finalAmount}&cu=INR&tn=TG_Gaming_Deposit`;
                    try {
                      window.location.href = `phonepe://pay?pa=${adminSettings.adminUpiId}&pn=${encodeURIComponent(adminSettings.adminMerchantName)}&am=${finalAmount}&cu=INR&tn=TG_Gaming_Deposit`;
                      setTimeout(() => {
                        window.location.href = standardUpi;
                      }, 400);
                    } catch {
                      window.location.href = standardUpi;
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95 border border-purple-400/40"
                >
                  <div className="w-5 h-5 rounded-full bg-white text-purple-700 flex items-center justify-center font-black text-xs">
                    पे
                  </div>
                  <span>PhonePe से ऑटो पे करें (Pay ₹{finalAmount})</span>
                </a>

                <div className="flex gap-2">
                  <a
                    href={`upi://pay?pa=${adminSettings.adminUpiId}&pn=${encodeURIComponent(adminSettings.adminMerchantName)}&am=${finalAmount}&cu=INR&tn=TG_Gaming_Deposit`}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <span>Any UPI App (GPay/Paytm)</span>
                  </a>
                </div>

                <p className="text-[10px] text-purple-300/90 font-medium">
                  ⚡ बटन दबाते ही PhonePe खुलेगा और ₹{finalAmount} अपने आप लिखा हुआ आ जाएगा।
                </p>
              </div>

              {/* Supported UPI Apps strip */}
              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <span>Supports:</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-semibold text-purple-300">PhonePe</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-semibold text-slate-300">Google Pay</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-semibold text-cyan-300">Paytm</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-semibold text-emerald-300">BHIM</span>
              </div>
            </div>

            {/* Step 2: Enter UTR / Ref Number */}
            <form onSubmit={handleSubmitDeposit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  2. {t.enterUtr} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.utrPlaceholder}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm tracking-wider focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span>{t.utrHelp}</span>
                </p>
              </div>

              {/* Quick sample UTR for instant demo testing */}
              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setUtrNumber(Math.floor(100000000000 + Math.random() * 900000000000).toString())}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  ⚡ Auto-fill Test UTR (डेमो के लिए)
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {submittedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{t.depositSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t.submitPayment} (₹{finalAmount})</span>
              </button>
            </form>
          </div>
        ) : (
          /* Payment History Tab */
          <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                My Deposit History
              </h4>
              <span className="text-[11px] text-slate-400">
                {userPayments.length} Requests
              </span>
            </div>

            {userPayments.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No deposit requests yet. Submit your first UPI payment!
              </div>
            ) : (
              userPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-num font-bold text-sm text-white">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        p.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : p.status === 'rejected'
                          ? 'bg-red-950 text-red-400 border border-red-500/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse'
                      }`}
                    >
                      {p.status === 'approved' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t.approved}</span>
                        </>
                      ) : p.status === 'rejected' ? (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>{t.rejected}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{t.pending}</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>UTR: {p.utrNumber}</span>
                    <span>{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {p.status === 'rejected' && p.rejectReason && (
                    <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/60 text-[11px] text-red-300">
                      Reason: {p.rejectReason}
                    </div>
                  )}

                  {p.status === 'pending' && (
                    <p className="text-[10px] text-amber-400/80">
                      ⏳ Admin verification in progress. Please check VIP Admin panel to approve.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
