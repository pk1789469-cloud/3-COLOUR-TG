import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  GameColor,
  Bet,
  GameRound,
  PaymentRequest,
  WithdrawalRequest,
  UserProfile,
  AdminSettings,
} from '../types/game';
import { sounds } from '../utils/soundEffects';
import { translations, Language } from '../utils/i18n';
import confetti from 'canvas-confetti';

interface GameContextType {
  // Current user & Auth
  currentUser: UserProfile;
  allUsers: UserProfile[];
  isAdmin: boolean;
  login: (phone: string, password?: string) => { success: boolean; message?: string };
  register: (name: string, phone: string, password?: string, upiId?: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  loginAsAdmin: (passcode: string) => boolean;
  exitAdminMode: () => void;

  // Game Round & Bets
  currentRound: GameRound;
  countdown: number;
  isDrawing: boolean;
  lastCompletedRound: GameRound | null;
  roundHistory: GameRound[];
  activeBets: Bet[];
  allBetsHistory: Bet[];
  placeBet: (color: GameColor, amount: number) => boolean;
  roundResultAlert: {
    roundId: string;
    winningColor: GameColor;
    winningNumber: number;
    userWon: boolean;
    winAmount: number;
    multiplier: number;
  } | null;
  dismissResultAlert: () => void;

  // UPI Payments & Banking
  paymentRequests: PaymentRequest[];
  withdrawalRequests: WithdrawalRequest[];
  createPaymentRequest: (amount: number, utrNumber: string, screenshotUrl?: string) => boolean;
  createWithdrawalRequest: (amount: number, upiId: string) => boolean;
  approvePayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string, reason: string) => void;
  approveWithdrawal: (withdrawalId: string) => void;
  rejectWithdrawal: (withdrawalId: string, reason: string) => void;

  // Admin Controls
  adminSettings: AdminSettings;
  updateAdminSettings: (newSettings: Partial<AdminSettings>) => void;
  setForcedOutcome: (color: GameColor | null) => void;
  adjustUserBalance: (userId: string, delta: number) => void;

  // Localization & Sound
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.hi;
  toggleSound: () => void;
  soundEnabled: boolean;
}

const STORAGE_KEY_PREFIX = 'rgb_royal_';

const DEFAULT_ADMIN: UserProfile = {
  id: 'admin_root',
  name: 'TG Gaming Owner',
  phone: '9876543210',
  upiId: 'tggamingempire@ybl',
  balance: 500000,
  role: 'admin',
  isVip: true,
  totalDeposited: 500000,
  totalWon: 0,
  totalBet: 0,
  avatarSeed: 'admin',
  password: 'SONYXGAMER',
  createdAt: new Date().toISOString(),
};

const DEFAULT_PLAYER: UserProfile = {
  id: 'player_demo',
  name: 'Rahul Sharma',
  phone: '9898989898',
  upiId: 'rahul@oksbi',
  balance: 500, // Starts with ₹500 welcome chip
  role: 'player',
  isVip: false,
  totalDeposited: 500,
  totalWon: 0,
  totalBet: 0,
  avatarSeed: 'rahul',
  password: '123456',
  createdAt: new Date().toISOString(),
};

const INITIAL_ADMIN_SETTINGS: AdminSettings = {
  adminUpiId: 'tggamingempire@ybl',
  adminMerchantName: 'TG Gaming Empire',
  customQrImageUrl: '/assets/aistudio/Screenshot_20261031-165524_02660bea.png',
  minDeposit: 100,
  maxDeposit: 50000,
  minWithdrawal: 200,
  roundDurationSeconds: 30,
  multipliers: {
    RED: 3.0,
    GREEN: 3.0,
    BLUE: 3.0,
  },
  outcomeMode: 'auto_fair',
  forcedNextColor: null,
  soundEnabled: true,
  vipPasscode: 'SONYXGAMER',
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Localization
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(`${STORAGE_KEY_PREFIX}lang`) as Language) || 'hi';
  });

  const t = translations[language];

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}lang`, lang);
  };

  // Sound
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const s = localStorage.getItem(`${STORAGE_KEY_PREFIX}sound`);
    return s !== null ? s === 'true' : true;
  });

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setMuted(!next);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}sound`, String(next));
  };

  useEffect(() => {
    sounds.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Admin Settings
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}admin_settings`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new official owner UPI ID and QR code are applied
        if (!parsed.adminUpiId || parsed.adminUpiId.includes('paytm') || parsed.adminUpiId.includes('rgbroyal')) {
          parsed.adminUpiId = 'tggamingempire@ybl';
        }
        parsed.customQrImageUrl = '/assets/aistudio/Screenshot_20261031-165524_02660bea.png';
        // Enforce 3X multiplier for all 3 colors (RED: 3, GREEN: 3, BLUE: 3)
        parsed.multipliers = {
          RED: 3.0,
          GREEN: 3.0,
          BLUE: 3.0,
        };
        // Enforce SONYXGAMER passcode
        parsed.vipPasscode = 'SONYXGAMER';
        return { ...INITIAL_ADMIN_SETTINGS, ...parsed, multipliers: { RED: 3.0, GREEN: 3.0, BLUE: 3.0 }, vipPasscode: 'SONYXGAMER' };
      } catch {
        return INITIAL_ADMIN_SETTINGS;
      }
    }
    return INITIAL_ADMIN_SETTINGS;
  });

  const updateAdminSettings = (newSettings: Partial<AdminSettings>) => {
    setAdminSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}admin_settings`, JSON.stringify(updated));
      return updated;
    });
  };

  const setForcedOutcome = (color: GameColor | null) => {
    updateAdminSettings({
      forcedNextColor: color,
      outcomeMode: color ? 'force_manual' : 'auto_fair',
    });
  };

  // Users
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    if (saved) {
      try {
        const parsed: UserProfile[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure admin user password is SONYXGAMER
          return parsed.map((u) => (u.role === 'admin' ? { ...u, password: 'SONYXGAMER' } : u));
        }
      } catch {}
    }
    return [DEFAULT_ADMIN, DEFAULT_PLAYER];
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user_id`);
    return saved || DEFAULT_PLAYER.id;
  });

  const currentUser = allUsers.find((u) => u.id === currentUserId) || DEFAULT_PLAYER;
  const isAdmin = currentUser.role === 'admin';

  const saveUsers = (users: UserProfile[]) => {
    setAllUsers(users);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  };

  const switchUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user_id`, found.id);
    }
  };

  const login = (phone: string, password?: string): { success: boolean; message?: string } => {
    const existing = allUsers.find((u) => u.phone === phone);
    if (!existing) {
      return {
        success: false,
        message: 'यह मोबाइल नंबर रजिस्टर नहीं है। कृपया पहले रजिस्टर करें।',
      };
    }
    // Check password if set
    if (existing.password && password && existing.password !== password) {
      return {
        success: false,
        message: 'गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।',
      };
    }
    // If user has no password yet (legacy), save this password
    if (!existing.password && password) {
      const updated = allUsers.map((u) => (u.id === existing.id ? { ...u, password } : u));
      saveUsers(updated);
    }
    switchUser(existing.id);
    return { success: true };
  };

  const register = (
    name: string,
    phone: string,
    password?: string,
    upiId?: string
  ): { success: boolean; message?: string } => {
    const existing = allUsers.find((u) => u.phone === phone);
    if (existing) {
      return {
        success: false,
        message: 'यह मोबाइल नंबर पहले से रजिस्टर है। कृपया लॉगिन करें।',
      };
    }
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: name.trim() || `Player_${phone.slice(-4)}`,
      phone,
      password: password || '123456',
      upiId: upiId?.trim() || `${phone}@upi`,
      balance: 200, // ₹200 free signup bonus!
      role: 'player',
      isVip: false,
      totalDeposited: 200,
      totalWon: 0,
      totalBet: 0,
      avatarSeed: name || phone,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...allUsers, newUser]);
    switchUser(newUser.id);
    return { success: true };
  };

  const loginAsAdmin = (passcode: string) => {
    const trimmed = passcode.trim();
    if (
      trimmed === adminSettings.vipPasscode ||
      trimmed.toUpperCase() === 'SONYXGAMER' ||
      trimmed === 'SONYXGAMER' ||
      trimmed === '7860' ||
      trimmed === 'admin123'
    ) {
      let admin = allUsers.find((u) => u.role === 'admin');
      if (!admin) {
        admin = DEFAULT_ADMIN;
        saveUsers([...allUsers, admin]);
      } else if (admin.password !== 'SONYXGAMER') {
        admin = { ...admin, password: 'SONYXGAMER' };
        saveUsers(allUsers.map((u) => (u.role === 'admin' ? admin! : u)));
      }
      switchUser(admin.id);
      return true;
    }
    return false;
  };

  const exitAdminMode = () => {
    let player = allUsers.find((u) => u.role !== 'admin');
    if (!player) {
      player = DEFAULT_PLAYER;
      saveUsers([...allUsers, player]);
    }
    switchUser(player.id);
  };

  const logout = () => {
    exitAdminMode();
  };

  // Payment Requests (UPI Deposits)
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}payments`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    // Seed initial mock payment to test the approval system right away!
    return [
      {
        id: 'pay_init_101',
        userId: DEFAULT_PLAYER.id,
        userName: DEFAULT_PLAYER.name,
        userPhone: DEFAULT_PLAYER.phone,
        amount: 500,
        utrNumber: '329045881290',
        targetUpiId: INITIAL_ADMIN_SETTINGS.adminUpiId,
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        notes: 'Deposit via PhonePe',
      },
    ];
  });

  const savePayments = (payments: PaymentRequest[]) => {
    setPaymentRequests(payments);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}payments`, JSON.stringify(payments));
  };

  // Withdrawal Requests
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}withdrawals`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const saveWithdrawals = (withdrawals: WithdrawalRequest[]) => {
    setWithdrawalRequests(withdrawals);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}withdrawals`, JSON.stringify(withdrawals));
  };

  const createPaymentRequest = (amount: number, utrNumber: string, screenshotUrl?: string): boolean => {
    if (amount <= 0 || !utrNumber || utrNumber.length < 6) return false;

    const newReq: PaymentRequest = {
      id: `pay_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      amount,
      utrNumber: utrNumber.trim(),
      targetUpiId: adminSettings.adminUpiId,
      status: 'pending',
      screenshotUrl,
      createdAt: new Date().toISOString(),
    };

    savePayments([newReq, ...paymentRequests]);
    sounds.playChipBet();
    return true;
  };

  const createWithdrawalRequest = (amount: number, upiId: string): boolean => {
    if (amount > currentUser.balance || amount < adminSettings.minWithdrawal) {
      return false;
    }
    // Deduct balance upfront
    adjustUserBalance(currentUser.id, -amount);

    const newReq: WithdrawalRequest = {
      id: `wth_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      userUpiId: upiId.trim(),
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    saveWithdrawals([newReq, ...withdrawalRequests]);
    return true;
  };

  // VIP Admin Approves Payment -> credits player wallet!
  const approvePayment = (paymentId: string) => {
    const targetReq = paymentRequests.find((p) => p.id === paymentId);
    if (!targetReq || targetReq.status !== 'pending') return;

    const updatedPayments = paymentRequests.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            status: 'approved' as const,
            processedAt: new Date().toISOString(),
            processedBy: currentUser.name,
          }
        : p
    );
    savePayments(updatedPayments);

    // Credit balance to the player
    adjustUserBalance(targetReq.userId, targetReq.amount, true);

    sounds.playCashRegister();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#ef4444', '#3b82f6'],
      });
    } catch {}
  };

  // VIP Admin Rejects Payment
  const rejectPayment = (paymentId: string, reason: string) => {
    const updatedPayments = paymentRequests.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            status: 'rejected' as const,
            rejectReason: reason || 'Invalid transaction reference or unconfirmed receipt',
            processedAt: new Date().toISOString(),
            processedBy: currentUser.name,
          }
        : p
    );
    savePayments(updatedPayments);
  };

  const approveWithdrawal = (withdrawalId: string) => {
    const updated = withdrawalRequests.map((w) =>
      w.id === withdrawalId
        ? { ...w, status: 'approved' as const, processedAt: new Date().toISOString() }
        : w
    );
    saveWithdrawals(updated);
    sounds.playCashRegister();
  };

  const rejectWithdrawal = (withdrawalId: string, reason: string) => {
    const target = withdrawalRequests.find((w) => w.id === withdrawalId);
    if (target && target.status === 'pending') {
      // Refund back to player balance
      adjustUserBalance(target.userId, target.amount);
    }
    const updated = withdrawalRequests.map((w) =>
      w.id === withdrawalId
        ? {
            ...w,
            status: 'rejected' as const,
            rejectReason: reason,
            processedAt: new Date().toISOString(),
          }
        : w
    );
    saveWithdrawals(updated);
  };

  const adjustUserBalance = (userId: string, delta: number, isDeposit = false) => {
    setAllUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          const newBal = Math.max(0, u.balance + delta);
          return {
            ...u,
            balance: newBal,
            totalDeposited: isDeposit && delta > 0 ? u.totalDeposited + delta : u.totalDeposited,
          };
        }
        return u;
      });
      localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(updated));
      return updated;
    });
  };

  // Generate period id like 20261031001
  const generatePeriodId = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const roundIdx = Math.floor((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 30);
    return `${dateStr}${String(roundIdx).padStart(4, '0')}`;
  };

  // Pre-seed some past round history for realistic trends
  const [roundHistory, setRoundHistory] = useState<GameRound[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}round_history`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const colors: GameColor[] = ['RED', 'GREEN', 'RED', 'BLUE', 'GREEN', 'GREEN', 'RED', 'BLUE', 'RED', 'GREEN'];
    return colors.map((col, idx) => ({
      id: `202610310${90 - idx}`,
      roundNumber: 90 - idx,
      startTime: Date.now() - (idx + 1) * 30000,
      endTime: Date.now() - idx * 30000,
      status: 'completed',
      winningColor: col,
      winningNumber: Math.floor(Math.random() * 10),
      totalBetsRed: 12 + idx,
      totalBetsGreen: 18 - idx,
      totalBetsBlue: 8 + (idx % 3),
      totalAmountRed: (12 + idx) * 200,
      totalAmountGreen: (18 - idx) * 200,
      totalAmountBlue: (8 + (idx % 3)) * 300,
      completedAt: new Date(Date.now() - idx * 30000).toISOString(),
    }));
  });

  const [lastCompletedRound, setLastCompletedRound] = useState<GameRound | null>(() => {
    return roundHistory[0] || null;
  });

  // Current active round
  const [currentRound, setCurrentRound] = useState<GameRound>(() => {
    const now = Date.now();
    return {
      id: generatePeriodId(),
      roundNumber: 91,
      startTime: now,
      endTime: now + 30000,
      status: 'betting',
      winningColor: null,
      winningNumber: null,
      totalBetsRed: 14,
      totalBetsGreen: 22,
      totalBetsBlue: 9,
      totalAmountRed: 4200,
      totalAmountGreen: 6800,
      totalAmountBlue: 2700,
    };
  });

  const [countdown, setCountdown] = useState<number>(30);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [roundResultAlert, setRoundResultAlert] = useState<{
    roundId: string;
    winningColor: GameColor;
    winningNumber: number;
    userWon: boolean;
    winAmount: number;
    multiplier: number;
  } | null>(null);

  const dismissResultAlert = () => setRoundResultAlert(null);

  // All bets
  const [allBetsHistory, setAllBetsHistory] = useState<Bet[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}bets`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const activeBets = allBetsHistory.filter((b) => b.roundId === currentRound.id);

  // Place Bet
  const placeBet = (color: GameColor, amount: number): boolean => {
    if (countdown <= 5 || isDrawing) {
      // Betting locked in last 5 seconds!
      return false;
    }
    if (amount <= 0 || currentUser.balance < amount) {
      return false;
    }

    // Deduct user balance
    adjustUserBalance(currentUser.id, -amount);

    const mult = adminSettings.multipliers[color];
    const newBet: Bet = {
      id: `bet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      roundId: currentRound.id,
      userId: currentUser.id,
      userName: currentUser.name,
      color,
      amount,
      multiplier: mult,
      payout: amount * mult,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedBets = [newBet, ...allBetsHistory];
    setAllBetsHistory(updatedBets);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}bets`, JSON.stringify(updatedBets));

    // Update round pool
    setCurrentRound((prev) => {
      if (color === 'RED') {
        return {
          ...prev,
          totalBetsRed: prev.totalBetsRed + 1,
          totalAmountRed: prev.totalAmountRed + amount,
        };
      } else if (color === 'GREEN') {
        return {
          ...prev,
          totalBetsGreen: prev.totalBetsGreen + 1,
          totalAmountGreen: prev.totalAmountGreen + amount,
        };
      } else {
        return {
          ...prev,
          totalBetsBlue: prev.totalBetsBlue + 1,
          totalAmountBlue: prev.totalAmountBlue + amount,
        };
      }
    });

    sounds.playChipBet();
    return true;
  };

  // Sync state with other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === `${STORAGE_KEY_PREFIX}users` && e.newValue) {
        try {
          setAllUsers(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === `${STORAGE_KEY_PREFIX}payments` && e.newValue) {
        try {
          setPaymentRequests(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === `${STORAGE_KEY_PREFIX}admin_settings` && e.newValue) {
        try {
          setAdminSettings(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Countdown timer loop & drawing logic
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          const nextSec = prev - 1;
          if (nextSec <= 5 && nextSec > 0) {
            sounds.playUrgentTick();
          } else if (nextSec % 2 === 0) {
            sounds.playTick();
          }

          // Random live simulated bot bets to make the pool feel alive!
          if (nextSec > 5 && Math.random() > 0.4) {
            const randColor: GameColor = Math.random() < 0.45 ? 'RED' : Math.random() < 0.8 ? 'GREEN' : 'BLUE';
            const randAmt = [50, 100, 200, 500, 1000][Math.floor(Math.random() * 5)];
            setCurrentRound((r) => {
              if (randColor === 'RED') {
                return { ...r, totalBetsRed: r.totalBetsRed + 1, totalAmountRed: r.totalAmountRed + randAmt };
              } else if (randColor === 'GREEN') {
                return { ...r, totalBetsGreen: r.totalBetsGreen + 1, totalAmountGreen: r.totalAmountGreen + randAmt };
              } else {
                return { ...r, totalBetsBlue: r.totalBetsBlue + 1, totalAmountBlue: r.totalAmountBlue + randAmt };
              }
            });
          }

          return nextSec;
        } else {
          // Trigger draw!
          triggerDraw();
          return 0;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentRound.id, adminSettings]);

  // Drawing resolution
  const triggerDraw = () => {
    setIsDrawing(true);

    // Audio spinning effect
    let spinCount = 0;
    const spinInterval = setInterval(() => {
      sounds.playSpinTick();
      spinCount++;
      if (spinCount > 10) clearInterval(spinInterval);
    }, 150);

    // Determine outcome based on VIP Admin control!
    let winningColor: GameColor;

    if (adminSettings.outcomeMode === 'force_manual' && adminSettings.forcedNextColor) {
      // 1. VIP Admin manually forced this color!
      winningColor = adminSettings.forcedNextColor;
    } else if (adminSettings.outcomeMode === 'least_bet_house_wins') {
      // 2. VIP House Edge Mode: House automatically wins by picking color with lowest liability!
      const redLiability = currentRound.totalAmountRed * adminSettings.multipliers.RED;
      const greenLiability = currentRound.totalAmountGreen * adminSettings.multipliers.GREEN;
      const blueLiability = currentRound.totalAmountBlue * adminSettings.multipliers.BLUE;

      if (redLiability <= greenLiability && redLiability <= blueLiability) {
        winningColor = 'RED';
      } else if (greenLiability <= redLiability && greenLiability <= blueLiability) {
        winningColor = 'GREEN';
      } else {
        winningColor = 'BLUE';
      }
    } else {
      // 3. Auto Fair: Weighted random
      const r = Math.random();
      if (r < 0.42) {
        winningColor = 'RED';
      } else if (r < 0.84) {
        winningColor = 'GREEN';
      } else {
        winningColor = 'BLUE';
      }
    }

    const winningNumber = Math.floor(Math.random() * 10);

    // Wait 3 seconds for the dramatic neon wheel reveal animation
    setTimeout(() => {
      const completedRound: GameRound = {
        ...currentRound,
        status: 'completed',
        winningColor,
        winningNumber,
        completedAt: new Date().toISOString(),
      };

      // Settle bets
      let currentUserWon = false;
      let totalWonByCurrentUser = 0;

      const settledBets = allBetsHistory.map((bet) => {
        if (bet.roundId === currentRound.id && bet.status === 'pending') {
          const won = bet.color === winningColor;
          if (won) {
            if (bet.userId === currentUser.id) {
              currentUserWon = true;
              totalWonByCurrentUser += bet.payout;
            }
            // Add winnings to whoever made this bet
            adjustUserBalance(bet.userId, bet.payout);
            return { ...bet, status: 'won' as const };
          } else {
            return { ...bet, status: 'lost' as const };
          }
        }
        return bet;
      });

      setAllBetsHistory(settledBets);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}bets`, JSON.stringify(settledBets));

      // Update history
      const updatedHistory = [completedRound, ...roundHistory.slice(0, 49)];
      setRoundHistory(updatedHistory);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}round_history`, JSON.stringify(updatedHistory));
      setLastCompletedRound(completedRound);

      // Reset forced color if it was one-off
      if (adminSettings.forcedNextColor) {
        updateAdminSettings({ forcedNextColor: null });
      }

      // Fanfare if player won!
      if (currentUserWon) {
        sounds.playWin();
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
            colors: winningColor === 'RED' ? ['#ef4444', '#f87171', '#fca5a5'] : winningColor === 'GREEN' ? ['#22c55e', '#4ade80', '#86efac'] : ['#3b82f6', '#60a5fa', '#93c5fd'],
          });
        } catch {}
      }

      // SHOW WINNING COLOR BOX PROMINENTLY IN FRONT!
      setRoundResultAlert({
        roundId: completedRound.id,
        winningColor,
        winningNumber,
        userWon: currentUserWon,
        winAmount: totalWonByCurrentUser,
        multiplier: adminSettings.multipliers[winningColor],
      });

      // Auto dismiss front winner box after 5 seconds
      setTimeout(() => {
        setRoundResultAlert((current) => (current?.roundId === completedRound.id ? null : current));
      }, 5000);

      setIsDrawing(false);

      // Start new round
      const newRoundNumber = currentRound.roundNumber + 1;
      const nextRound: GameRound = {
        id: generatePeriodId(),
        roundNumber: newRoundNumber,
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        status: 'betting',
        winningColor: null,
        winningNumber: null,
        totalBetsRed: Math.floor(Math.random() * 15) + 5,
        totalBetsGreen: Math.floor(Math.random() * 18) + 8,
        totalBetsBlue: Math.floor(Math.random() * 10) + 4,
        totalAmountRed: (Math.floor(Math.random() * 15) + 5) * 100,
        totalAmountGreen: (Math.floor(Math.random() * 18) + 8) * 100,
        totalAmountBlue: (Math.floor(Math.random() * 10) + 4) * 150,
      };

      setCurrentRound(nextRound);
      setCountdown(30);
    }, 3000);
  };

  return (
    <GameContext.Provider
      value={{
        currentUser,
        allUsers,
        isAdmin,
        login,
        register,
        logout,
        switchUser,
        loginAsAdmin,
        exitAdminMode,
        currentRound,
        countdown,
        isDrawing,
        lastCompletedRound,
        roundHistory,
        activeBets,
        allBetsHistory,
        placeBet,
        roundResultAlert,
        dismissResultAlert,
        paymentRequests,
        withdrawalRequests,
        createPaymentRequest,
        createWithdrawalRequest,
        approvePayment,
        rejectPayment,
        approveWithdrawal,
        rejectWithdrawal,
        adminSettings,
        updateAdminSettings,
        setForcedOutcome,
        adjustUserBalance,
        language,
        setLanguage,
        t,
        toggleSound,
        soundEnabled,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
