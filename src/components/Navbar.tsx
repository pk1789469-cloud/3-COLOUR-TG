import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Wallet,
  ShieldCheck,
  Volume2,
  VolumeX,
  Globe,
  LogIn,
  Crown,
  PlusCircle,
  User,
  ArrowUpRight,
  LogOut,
  Settings,
} from 'lucide-react';

interface NavbarProps {
  onOpenDeposit: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenWithdraw: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDeposit,
  onOpenAuth,
  onOpenWithdraw,
  onOpenSettings,
}) => {
  const {
    currentUser,
    isAdmin,
    language,
    setLanguage,
    t,
    soundEnabled,
    toggleSound,
    logout,
    exitAdminMode,
    allUsers,
    switchUser,
  } = useGame();

  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo with TG Glow */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 via-red-500 to-blue-500 p-[2px] shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-gaming font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-blue-400 text-base sm:text-xl tracking-wider">
                TG
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-gaming font-black text-base sm:text-2xl tracking-wide text-white drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                TG GAMING
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black tracking-wider bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 uppercase shadow-sm">
                OWNER
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 hidden xs:block font-medium">
              3-Color Prediction & UPI Club
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Direct Visible Login & Register Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
              title={t.login}
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.login}</span>
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95"
              title={t.register}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t.register}</span>
            </button>
          </div>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'hi' ? 'हिंदी' : 'ENG'}</span>
          </button>

          {/* Wallet Balance Card */}
          <div className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800/80 border border-amber-500/40 shadow-inner">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                {t.walletBalance}
              </span>
              <span className="font-mono-num font-bold text-xs sm:text-sm text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                ₹{currentUser.balance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Quick Deposit Button */}
          <button
            onClick={onOpenDeposit}
            className="relative group overflow-hidden px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1 shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 stroke-[2.5]" />
            <span className="font-extrabold tracking-wide">{t.deposit}</span>
          </button>

          {/* Settings Button (Houses Language, Sound & Secret VIP Admin Owner Control) */}
          <button
            onClick={onOpenSettings}
            title={t.settings}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-400 text-slate-200 hover:text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm group"
          >
            <Settings className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            <span className="hidden sm:inline">{t.settings}</span>
          </button>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline max-w-[90px] truncate">{currentUser.name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-3 z-50 backdrop-blur-xl">
                <div className="pb-3 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white text-sm">{currentUser.name}</p>
                    {isAdmin ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black">
                        ADMIN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                        PLAYER
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{currentUser.phone}</p>
                  <p className="text-xs text-amber-400 mt-1 font-semibold">
                    {t.walletBalance}: ₹{currentUser.balance.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="py-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenDeposit();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-between"
                  >
                    <span>{t.deposit}</span>
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenWithdraw();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>{t.withdraw}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>{t.settings}</span>
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>

                {/* Quick Account Switcher for Testing */}
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-bold">
                    Quick Switch Account
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                          u.id === currentUser.id
                            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{u.name} {u.role === 'admin' ? '👑' : ''}</span>
                        <span className="text-[10px] font-mono">₹{u.balance}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1.5 mt-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuth('login');
                      }}
                      className="flex-1 py-1.5 text-center text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 rounded-lg"
                    >
                      {t.login}
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuth('register');
                      }}
                      className="flex-1 py-1.5 text-center text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 rounded-lg border border-emerald-500/30"
                    >
                      {t.register}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
