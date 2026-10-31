import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Settings,
  X,
  Globe,
  Volume2,
  VolumeX,
  Crown,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPanel: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminPanel,
}) => {
  const {
    language,
    setLanguage,
    t,
    soundEnabled,
    toggleSound,
    isAdmin,
    loginAsAdmin,
    exitAdminMode,
    adminSettings,
  } = useGame();

  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);
  const [successUnlock, setSuccessUnlock] = useState(false);

  if (!isOpen) return null;

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(false);

    if (!passcode.trim()) {
      setPassError(true);
      return;
    }

    const success = loginAsAdmin(passcode.trim());
    if (success) {
      setSuccessUnlock(true);
      setPasscode('');
      sounds.playWin();
      setTimeout(() => {
        setSuccessUnlock(false);
      }, 1500);
    } else {
      setPassError(true);
      sounds.playUrgentTick();
    }
  };

  const handleOpenFullAdmin = () => {
    onClose();
    onOpenAdminPanel();
  };

  const handleTestSound = () => {
    sounds.playChipBet();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md my-6 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <Settings className="w-5 h-5 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                {t.settings}
              </h3>
              <p className="text-[11px] text-slate-400">
                Language, Audio & Owner Controls
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

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: LANGUAGE */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">
                  {t.languageSetting}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  language === 'hi'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>🇮🇳 हिन्दी (Hindi)</span>
                {language === 'hi' && <CheckCircle className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  language === 'en'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>🌐 English</span>
                {language === 'en' && <CheckCircle className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* SECTION 2: SOUND */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-xs font-bold text-slate-200">
                  {t.soundSetting}
                </span>
              </div>

              {/* Toggle switch button */}
              <button
                type="button"
                onClick={toggleSound}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Status: <strong className={soundEnabled ? 'text-emerald-400' : 'text-slate-500'}>
                  {soundEnabled ? t.soundOn : t.soundOff}
                </strong>
              </span>

              {soundEnabled && (
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-600 active:scale-95 transition-all"
                >
                  🔊 टेस्ट साउंड (Test Beep)
                </button>
              )}
            </div>
          </div>

          {/* SECTION 3: VIP ADMIN OWNER CONTROL (HIDDEN FROM MAIN SCREEN) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 border border-amber-500/30 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300 tracking-wide uppercase">
                    {t.adminSectionTitle}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {t.adminSectionDesc}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-slate-950">
                  ACTIVE
                </span>
              )}
            </div>

            {isAdmin ? (
              /* If Admin is already unlocked / logged in */
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-200">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>{t.adminUnlocked}!</strong> आप गेम कलर, UPI और सभी पेमेंट्स कंट्रोल कर सकते हैं।
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenFullAdmin}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Sliders className="w-4 h-4 text-slate-950" />
                  <span>{t.openAdminPanel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exitAdminMode();
                    setSuccessUnlock(false);
                  }}
                  className="w-full py-1.5 rounded-lg text-slate-400 hover:text-red-400 text-[11px] font-semibold transition-all text-center block"
                >
                  {t.exitAdmin}
                </button>
              </div>
            ) : (
              /* If Locked: Passcode prompt */
              <form onSubmit={handleUnlockAdmin} className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    {t.enterPasscodeToUnlock}:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="e.g. SONYXGAMER"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setPassError(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono tracking-widest focus:border-amber-400 focus:outline-none placeholder:tracking-normal placeholder:font-sans"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  {passError && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>गलत पासकोड! कृपया सही मालिक पासकोड डालें (Default: SONYXGAMER)</span>
                    </p>
                  )}
                  {successUnlock && (
                    <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                      <CheckCircle className="w-3 h-3" />
                      <span>मालिक एक्सेस अनलॉक हो गया!</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{t.unlockAdmin}</span>
                </button>

                <p className="text-[10px] text-slate-500 text-center">
                  💡 केवल गेम मालिक के लिए। आम खिलाड़ियों के लिए यह बंद रहता है।
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            TG GAMING OWNER • RGB Royal 3-Color Engine
          </p>
        </div>
      </div>
    </div>
  );
};
