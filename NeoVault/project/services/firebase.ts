import {
  ref,
  get,
  set,
  push,
  update,
  onValue,
  off,
  query,
  orderByChild,
  limitToLast,
  runTransaction,
  equalTo,
} from "firebase/database";
import { database, auth } from "@/config/firebase";
import { createUserWithEmailAndPassword, updateProfile, User } from "firebase/auth";
import {
  Transaction,
  Device,
  Stats,
  Achievement,
  AchievementDefinition,
} from "@/types";
import * as Notifications from "expo-notifications";

export const updateUserProfile = async (
  userId: string,
  data: { displayName: string }
) => {
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
      });
    }

    const userRef = ref(database, `users/${userId}`);
    await update(userRef, data);
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const getConnectedDevices = async (
  userId: string
): Promise<Device[]> => {
  try {
    const devicesRef = ref(database, "devices");
    const snapshot = await get(devicesRef);
    const devices = snapshot.val();

    if (!devices) return [];

    return Object.entries(devices)
      .filter(
        ([_, device]: [string, any]) =>
          device.connectedUsers && device.connectedUsers[userId]
      )
      .map(([id, device]: [string, any]) => ({
        ...device,
        id,
      }));
  } catch (error) {
    console.error("Error getting connected devices:", error);
    throw error;
  }
};

export const connectDevice = async (
  userId: string,
  connectionString: string
): Promise<Device | null> => {
  try {
    const devicesRef = ref(database, "devices");
    const snapshot = await get(devicesRef);
    const devices = snapshot.val();

    let matchingDevice = null;
    let deviceId = null;

    if (!devices) {
      throw new Error("No available devices found");
    }

    Object.entries(devices).forEach(([id, device]: [string, any]) => {
      if (device.connectionString === connectionString) {
        matchingDevice = device;
        deviceId = id;
      }
    });

    if (!matchingDevice || !deviceId) {
      throw new Error("Invalid connection string");
    }

    const userConnection = {
      connectedAt: Date.now(),
      lastSync: Date.now(),
    };

    await update(
      ref(database, `devices/${deviceId}/connectedUsers/${userId}`),
      userConnection
    );

    const statsRef = ref(database, `stats/${userId}`);
    const statsSnapshot = await get(statsRef);
    if (!statsSnapshot.exists()) {
      await set(statsRef, {
        totalCents: 0,
        streakDays: 0,
        earnedAchievements: {},
      });
    }

    return {
      ...matchingDevice,
      id: deviceId,
    };
  } catch (error) {
    throw error;
  }
};

export const updateDevice = async (deviceId: string, data: Partial<Device>) => {
  try {
    const deviceRef = ref(database, `devices/${deviceId}`);
    await update(deviceRef, data);
    return true;
  } catch (error) {
    console.error("Error updating device:", error);
    throw error;
  }
};

export const disconnectDevice = async (userId: string, deviceId: string) => {
  try {
    await set(
      ref(database, `devices/${deviceId}/connectedUsers/${userId}`),
      null
    );
    return true;
  } catch (error) {
    console.error("Error disconnecting device:", error);
    throw error;
  }
};

export const unlinkDevice = async (userId: string, deviceId: string) => {
  try {
    const deviceRef = ref(
      database,
      `devices/${deviceId}/connectedUsers/${userId}`
    );
    await set(deviceRef, null);
    return true;
  } catch (error) {
    console.error("Error unlinking device:", error);
    throw error;
  }
};

const checkAndUnlockAchievements = async (userId: string, stats: Stats) => {
  try {
    const achievementsRef = ref(database, "achievementDefinitions");
    const snapshot = await get(achievementsRef);
    const definitions = snapshot.val() as Record<string, AchievementDefinition>;

    if (!definitions) return;

    const newAchievements: Record<string, Achievement> = {};

    Object.entries(definitions).forEach(([id, definition]) => {
      if (stats.earnedAchievements && stats.earnedAchievements[id]) return;

      let shouldUnlock = false;

      switch (definition.criteria.type) {
        case "total_amount":
          shouldUnlock = stats.totalCents >= definition.criteria.value;
          break;
        case "streak_days":
          shouldUnlock = stats.streakDays >= definition.criteria.value;
          break;
      }

      if (shouldUnlock) {
        newAchievements[id] = {
          id,
          name: definition.name,
          unlockedAt: Date.now(),
        };
      }
    });

    if (Object.keys(newAchievements).length > 0) {
      const updatedAchievements = {
        ...stats.earnedAchievements,
        ...newAchievements,
      };

      await update(ref(database, `stats/${userId}`), {
        earnedAchievements: updatedAchievements,
      });

      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      const user = userSnapshot.val();

      if (user?.notificationToken) {
        Object.values(newAchievements).forEach(async (achievement) => {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Achievement Unlocked! 🏆",
              body: `Congratulations! You've earned the "${achievement.name}" achievement!`,
            },
            trigger: null,
          });
        });
      }
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
};

export const getDeviceTransactions = async (
  deviceId: string
): Promise<Transaction[]> => {
  try {
    const transactionsRef = ref(database, `transactions/${deviceId}`);
    const snapshot = await get(transactionsRef);
    const transactions = snapshot.val();

    if (!transactions) return [];

    return Object.entries(transactions).map(
      ([id, transaction]: [string, any]) => ({
        id,
        ...transaction,
      })
    );
  } catch (error) {
    console.error("Error getting device transactions:", error);
    throw error;
  }
};

export const addTransaction = async (
  deviceId: string,
  userId: string,
  amountCents: number
) => {
  try {
    const transactionsRef = ref(database, `transactions/${deviceId}`);
    const newTransactionRef = push(transactionsRef);

    const transaction: Transaction = {
      id: newTransactionRef.key!,
      amountCents,
      timestamp: Date.now(),
      userId,
      type: "deposit",
    };

    await set(newTransactionRef, transaction);

    const deviceRef = ref(database, `devices/${deviceId}`);
    const deviceSnapshot = await get(deviceRef);
    const device = deviceSnapshot.val();
    await update(deviceRef, {
      totalCents: (device.totalCents || 0) + amountCents,
      [`connectedUsers/${userId}/lastSync`]: Date.now(),
    });

    const statsRef = ref(database, `stats/${userId}`);
    const statsSnapshot = await get(statsRef);
    const stats = statsSnapshot.val() || {
      totalCents: 0,
      streakDays: 0,
      earnedAchievements: {},
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDepositDate = stats.lastDepositDate
      ? new Date(stats.lastDepositDate)
      : null;
    if (lastDepositDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDepositDate.getTime() === yesterday.getTime()) {
        stats.streakDays++;
      } else if (lastDepositDate.getTime() < yesterday.getTime()) {
        stats.streakDays = 1;
      }
    } else {
      stats.streakDays = 1;
    }

    stats.totalCents = (stats.totalCents || 0) + amountCents;
    stats.lastDepositDate = today.getTime();

    await update(statsRef, stats);

    await checkAndUnlockAchievements(userId, stats);

    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    const user = userSnapshot.val();

    if (user?.notificationToken) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "New Deposit",
          body: `$${(amountCents / 100).toFixed(
            2
          )} has been added to your PiggyBank!`,
        },
        trigger: null,
      });
    }

    return transaction;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

export const getUserStats = async (userId: string): Promise<Stats> => {
  try {
    const statsRef = ref(database, `stats/${userId}`);
    const snapshot = await get(statsRef);
    return (
      snapshot.val() || { totalCents: 0, streakDays: 0, earnedAchievements: {} }
    );
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
};

export const getAchievementDefinitions = async () => {
  try {
    const achievementsRef = ref(database, "achievementDefinitions");
    const snapshot = await get(achievementsRef);
    return snapshot.val() || {};
  } catch (error) {
    console.error("Error getting achievement definitions:", error);
    throw error;
  }
};

export interface TransactionWithDevice extends Transaction {
  deviceId: string;
  deviceName: string;
}

export const getRecentTransactions = async (
  userId: string,
  limit = 3
): Promise<TransactionWithDevice[]> => {
  const devices: Device[] = await getConnectedDevices(userId);

  const nested: TransactionWithDevice[][] = await Promise.all(
    devices.map(async (device) => {
      const snap = await get(ref(database, `transactions/${device.id}`));
      const data = snap.val() as Record<
        string,
        Omit<TransactionWithDevice, "deviceId" | "deviceName">
      > | null;
      if (!data) return [];
      return Object.entries(data).map(([txId, tx]) => ({
        id: txId,
        deviceId: device.id,
        deviceName: device.name,
        ...tx,
      }));
    })
  );

  const allTx = nested.flat();
  allTx.sort((a, b) => b.timestamp - a.timestamp);
  return allTx.slice(0, limit);
};

export const editTransactionAmount = async ({
  deviceId,
  transactionId,
  userId,
  newAmountCents,
}: {
  deviceId: string;
  transactionId: string;
  userId: string;
  newAmountCents: number;
}) => {
  try {
    const transactionRef = ref(
      database,
      `transactions/${deviceId}/${transactionId}`
    );
    const transactionSnapshot = await get(transactionRef);
    const existingTransaction = transactionSnapshot.val();

    if (!existingTransaction) {
      throw new Error("Transaction not found");
    }

    const oldAmount = existingTransaction.amountCents;
    const diff = newAmountCents - oldAmount;

    await update(transactionRef, { amountCents: newAmountCents });

    const deviceTotalRef = ref(database, `devices/${deviceId}/totalCents`);
    await runTransaction(deviceTotalRef, (current) => (current || 0) + diff);

    const statsTotalRef = ref(database, `stats/${userId}/totalCents`);
    await runTransaction(statsTotalRef, (current) => (current || 0) + diff);

    return true;
  } catch (error) {
    console.error("Error editing transaction amount:", error);
    throw error;
  }
};

export const updateGoal = async (achievementId: string, newValue: number) => {
  const criteriaRef = ref(
    database,
    `achievementDefinitions/${achievementId}/criteria/value`
  );
  await set(criteriaRef, newValue);
};

export const sendFriendRequest = async (senderId: string, receiverEmail: string) => {
  try {
    const usersRef = ref(database, 'users');
    const receiverQuery = query(usersRef, orderByChild('email'), equalTo(receiverEmail));
    const receiverSnapshot = await get(receiverQuery);
    
    if (!receiverSnapshot.exists()) {
      throw new Error('User not found');
    }

    const requestsRef = ref(database, 'friendRequests');
    const existingRequestQuery = query(
      requestsRef,
      orderByChild('receiverEmail'),
      equalTo(receiverEmail)
    );
    const existingRequestSnapshot = await get(existingRequestQuery);
    
    const existingRequests = existingRequestSnapshot.val();
    if (existingRequests) {
      const hasExistingRequest = Object.values(existingRequests).some(
        (request: any) => request.senderId === senderId && request.status === 'pending'
      );
      if (hasExistingRequest) {
        throw new Error('Friend request already sent');
      }
    }

    const friendsRef = ref(database, 'friends');
    const receiverId = Object.keys(receiverSnapshot.val())[0];
    
    const existingFriendQuery1 = query(
      friendsRef,
      orderByChild('userId'),
      equalTo(senderId)
    );
    const existingFriendQuery2 = query(
      friendsRef,
      orderByChild('friendId'),
      equalTo(receiverId)
    );
    
    const [friendSnapshot1, friendSnapshot2] = await Promise.all([
      get(existingFriendQuery1),
      get(existingFriendQuery2)
    ]);
    
    const existingFriends1 = friendSnapshot1.val();
    const existingFriends2 = friendSnapshot2.val();
    
    if (existingFriends1 || existingFriends2) {
      const areFriends = Object.values(existingFriends1 || {}).some(
        (friend: any) => friend.friendId === receiverId
      ) || Object.values(existingFriends2 || {}).some(
        (friend: any) => friend.userId === senderId
      );
      
      if (areFriends) {
        throw new Error('You are already friends with this user');
      }
    }

    const newRequestRef = push(requestsRef);
    const request: FriendRequest = {
      id: newRequestRef.key!,
      senderId,
      receiverEmail,
      status: 'pending',
      timestamp: Date.now(),
    };
    
    await set(newRequestRef, request);

    const receiverUser = Object.values(receiverSnapshot.val())[0] as any;
    if (receiverUser.notificationToken) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New Friend Request',
          body: `You have a new friend request!`,
        },
        trigger: null,
      });
    }

    return request;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

export const acceptFriendRequest = async (requestId: string) => {
  try {
    const requestRef = ref(database, `friendRequests/${requestId}`);
    const requestSnapshot = await get(requestRef);
    const request = requestSnapshot.val();
    
    if (!request || request.status !== 'pending') {
      throw new Error('Invalid request');
    }

    const usersRef = ref(database, 'users');
    const receiverQuery = query(usersRef, orderByChild('email'), equalTo(request.receiverEmail));
    const receiverSnapshot = await get(receiverQuery);
    const receiverId = Object.keys(receiverSnapshot.val())[0];

    const friendsRef = ref(database, 'friends');
    const timestamp = Date.now();

    const friend1: Friend = {
      id: push(friendsRef).key!,
      userId: request.senderId,
      friendId: receiverId,
      timestamp,
    };

    const friend2: Friend = {
      id: push(friendsRef).key!,
      userId: receiverId,
      friendId: request.senderId,
      timestamp,
    };

    await update(requestRef, { status: 'accepted' });

    await Promise.all([
      set(ref(database, `friends/${friend1.id}`), friend1),
      set(ref(database, `friends/${friend2.id}`), friend2),
    ]);

    const senderRef = ref(database, `users/${request.senderId}`);
    const senderSnapshot = await get(senderRef);
    const sender = senderSnapshot.val();
    
    if (sender.notificationToken) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Friend Request Accepted',
          body: `${request.receiverEmail} accepted your friend request!`,
        },
        trigger: null,
      });
    }

    return { friend1, friend2 };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

export const rejectFriendRequest = async (requestId: string) => {
  try {
    const requestRef = ref(database, `friendRequests/${requestId}`);
    await update(requestRef, { status: 'rejected' });
    return true;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

interface UserProfile {
  displayName: string;
  email: string;
  createdAt: number;
  notificationToken?: string;
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  notificationToken?: string
): Promise<User> {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  await updateProfile(user, { displayName });

  const profile: UserProfile = {
    email: user.email!,
    displayName,
    createdAt: Date.now(),
    ...(notificationToken && { notificationToken }),
  };
  await set(ref(database, `users/${user.uid}`), profile);

  return user;
}