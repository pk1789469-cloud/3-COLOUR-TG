import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Send,
  Zap,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const { login, register, t, loginAsAdmin } = useGame();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [otp, setOtp] = useState('');

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialMode, isOpen]);

  // OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (otpCountdown > 0) {
      timer = setTimeout(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [otpCountdown]);

  if (!isOpen) return null;

  // Send OTP handler
  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('कृपया पहले 10-अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    setErrorMsg(null);

    // Generate random 4-digit OTP
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(mockOtp);
    setOtpCountdown(60);
    setOtpSentNotice(`📲 SMS OTP: ${mockOtp} (वेरिफिकेशन के लिए यह कोड डालें)`);

    // Auto-fill convenience button
    setTimeout(() => {
      setOtp(mockOtp);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!phone || phone.length < 10) {
      setErrorMsg('कृपया 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    if (mode === 'register') {
      // Validate OTP
      if (!otp) {
        setErrorMsg('कृपया प्राप्त हुआ 4-अंकों का OTP दर्ज करें।');
        return;
      }
      if (generatedOtp && otp !== generatedOtp && otp !== '1234') {
        setErrorMsg('गलत OTP! कृपया सही कोड दर्ज करें या दोबारा भेजें।');
        return;
      }

      if (confirmPassword && password !== confirmPassword) {
        setErrorMsg('पासवर्ड और कन्फर्म पासवर्ड मैच नहीं हो रहे हैं।');
        return;
      }

      const res = register(name || `Player_${phone.slice(-4)}`, phone, password, upiId);
      if (!res.success) {
        setErrorMsg(res.message || 'रजिस्ट्रेशन विफल रहा।');
        return;
      }

      setSuccessMsg('रजिस्ट्रेशन सफल! ₹200 बोनस आपके खाते में जुड़ गया है।');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      // LOGIN
      const res = login(phone, password);
      if (!res.success) {
        setErrorMsg(res.message || 'लॉगिन विफल रहा। कृपया नंबर और पासवर्ड जांचें।');
        return;
      }

      setSuccessMsg('लॉगिन सफल! स्वागत है TG Gaming Owner क्लब में।');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  // Quick One-Click Demo Logins for fast testing
  const handleQuickPlayer = () => {
    setPhone('9898989898');
    setPassword('123456');
    login('9898989898', '123456');
    onClose();
  };

  const handleQuickAdmin = () => {
    setPhone('9876543210');
    setPassword('7860');
    loginAsAdmin('7860');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm sm:max-w-md my-6 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-6 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-blue-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              TG
            </div>
            <div>
              <h3 className="font-gaming font-extrabold text-white text-base tracking-wide">
                TG GAMING OWNER
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'login' ? 'नंबर और पासवर्ड डालकर लॉगिन करें' : 'नंबर, OTP और पासवर्ड से रजिस्टर करें'}
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

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-950 p-1 my-4 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.login} (लॉगिन)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{t.register} (+₹200)</span>
          </button>
        </div>

        {/* Toast / Error / Success Messages */}
        {errorMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* OTP Simulation Alert */}
        {mode === 'register' && otpSentNotice && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-purple-900/30 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between animate-pulse">
            <span className="font-mono font-bold">{otpSentNotice}</span>
            <button
              type="button"
              onClick={() => generatedOtp && setOtp(generatedOtp)}
              className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-bold"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Mobile Number (Both Login & Register) */}
          <div>
            <label className="text-xs font-bold text-slate-200 block mb-1">
              मोबाइल नंबर (Mobile Number) *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 flex items-center gap-1 text-slate-400 text-xs font-mono font-bold">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+91</span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-16 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono tracking-wider focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. OTP Section (ONLY FOR REGISTER) */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">
                ओटीपी सत्यापन (OTP Verification) *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono tracking-widest focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                {/* Send OTP button */}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpCountdown > 0}
                  className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                    otpCountdown > 0
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black shadow-md'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{otpCountdown > 0 ? `${otpCountdown}s Resend` : 'OTP भेजें'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Password Field (Both Login & Register) */}
          <div>
            <label className="text-xs font-bold text-slate-200 block mb-1">
              {mode === 'login' ? 'पासवर्ड (Password) *' : 'नया पासवर्ड बनाएं (Create Password) *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 4. Confirm Password & UPI (ONLY FOR REGISTER) */}
          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  पासवर्ड दोबारा दर्ज करें (Confirm Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  आपका UPI ID (विथड्रॉल के लिए - ऑप्शनल):
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="उदा. mobile@paytm या name@oksbi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 mt-3 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/25'
                : 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-slate-950 shadow-emerald-500/25'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {mode === 'login' ? 'सुरक्षित लॉगिन करें (Login)' : 'रजिस्टर करें और ₹200 बोनस पाएं (Register)'}
            </span>
          </button>
        </form>

        {/* Quick Testing Short-cuts with Credentials Preview */}
        <div className="mt-5 pt-3.5 border-t border-slate-800">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider flex items-center justify-between">
            <span>⚡ क्विक टेस्ट (1-क्लिक ऑटो लॉगिन):</span>
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleQuickPlayer}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all"
            >
              <p className="font-bold text-white text-[11px]">👤 राहुल (Player)</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: 9898989898</p>
              <p className="text-[10px] text-amber-400 font-mono">Pass: 123456</p>
            </button>

            <button
              type="button"
              onClick={handleQuickAdmin}
              className="p-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-left transition-all"
            >
              <p className="font-bold text-amber-300 text-[11px]">👑 VIP Owner</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: 9876543210</p>
              <p className="text-[10px] text-amber-300 font-mono">Pass: 7860</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
