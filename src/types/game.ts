export type GameColor = 'RED' | 'GREEN' | 'BLUE';

export interface Bet {
  id: string;
  roundId: string;
  userId: string;
  userName: string;
  color: GameColor;
  amount: number;
  multiplier: number;
  payout: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
}

export interface GameRound {
  id: string; // e.g. "20261031089"
  roundNumber: number;
  startTime: number;
  endTime: number;
  status: 'betting' | 'drawing' | 'completed';
  winningColor: GameColor | null;
  winningNumber: number | null; // e.g. 0-9 for realistic feel
  totalBetsRed: number;
  totalBetsGreen: number;
  totalBetsBlue: number;
  totalAmountRed: number;
  totalAmountGreen: number;
  totalAmountBlue: number;
  forcedColor?: GameColor | null;
  completedAt?: string;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  utrNumber: string;
  targetUpiId: string;
  status: PaymentStatus;
  screenshotUrl?: string;
  notes?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectReason?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userUpiId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  processedAt?: string;
  rejectReason?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  upiId?: string;
  balance: number;
  role: 'player' | 'admin';
  isVip: boolean;
  totalDeposited: number;
  totalWon: number;
  totalBet: number;
  avatarSeed: string;
  password?: string;
  createdAt: string;
}

export type OutcomeControlMode = 
  | 'auto_fair'               // Standard pseudo-random distribution
  | 'least_bet_house_wins'    // VIP House Edge: color with the minimum total payout automatically wins!
  | 'force_manual';           // VIP Admin explicitly selects RED, GREEN, or BLUE

export interface AdminSettings {
  adminUpiId: string;
  adminMerchantName: string;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  roundDurationSeconds: number; // e.g. 30
  multipliers: {
    RED: number;
    GREEN: number;
    BLUE: number;
  };
  outcomeMode: OutcomeControlMode;
  forcedNextColor: GameColor | null;
  soundEnabled: boolean;
  vipPasscode: string;
  customQrImageUrl?: string;
}
