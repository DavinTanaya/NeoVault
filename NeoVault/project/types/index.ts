import { FirebaseApp } from "firebase/app";

export interface User {
  email: string;
  displayName?: string;
  createdAt: number;
  notificationToken?: string;
}

export interface Device {
  name: string;
  connectionString: string;
  status: "active" | "inactive";
  totalCents: number;
  connectedUsers: {
    [userId: string]: {
      connectedAt: number;
      lastSync: number;
    };
  };
}

export interface Transaction {
  id: string;
  amountCents: number;
  timestamp: number;
  userId: string;
  type: "deposit" | "withdrawal";
  notes?: string;
}

export interface Achievement {
  id: string;
  name: string;
  unlockedAt: number;
}

export interface Stats {
  totalCents: number;
  streakDays: number;
  lastDepositDate?: number;
  earnedAchievements: {
    [key: string]: Achievement;
  };
}

export interface AchievementDefinition {
  name: string;
  description: string;
  criteria: {
    type: "deposit_count" | "streak_days" | "total_amount";
    value: number;
  };
}

export interface DeviceConnection {
  connectionString: string;
  qrCode: string;
  expiresAt: number;
}


export interface FriendRequest {
  id: string;
  senderId: string;
  receiverEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  timestamp: number;
}
