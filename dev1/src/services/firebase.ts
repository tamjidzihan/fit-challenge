/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from 'firebase/app';
import { getAuth, type User } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import type { Challenge, Entry, Participant } from '../types';
import { ref, get, push, set, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  databaseURL: import.meta.env.VITE_DATABASEURL,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;

// === CHALLENGES ===
// === CHALLENGES ===
export const challengeService = {
  async getAll(): Promise<Challenge[]> {
    const snapshot = await get(ref(database, 'challenges'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();

    const challenges = Object.entries(data).map(([id, value]: any) => ({
      id,
      ...value,
    }));

    // Enhance participants with user data
    return await Promise.all(
      challenges.map(async (challenge) => {
        if (challenge.participants && Array.isArray(challenge.participants)) {
          // Check if participants are already enhanced (have user data)
          if (challenge.participants.length > 0 && typeof challenge.participants[0] === 'object') {
            return challenge; // Already enhanced
          }

          // Enhance string UIDs to Participant objects
          const enhancedParticipants = await Promise.all(
            challenge.participants.map(async (uid: string) => {
              try {
                const userData = await userService.getUserById(uid);
                return {
                  uid,
                  email: userData?.email || 'Unknown',
                  displayName: userData?.displayName || 'Unknown User'
                };
              } catch (error) {
                console.error(`Error fetching user ${uid}:`, error);
                return {
                  uid,
                  email: 'Unknown',
                  displayName: 'Unknown User'
                };
              }
            })
          );

          return {
            ...challenge,
            participants: enhancedParticipants
          };
        }
        return challenge;
      })
    );
  },

  async getById(id: string): Promise<Challenge | null> {
    const snapshot = await get(ref(database, `challenges/${id}`));
    if (!snapshot.exists()) return null;
    const challenge = { id, ...snapshot.val() };

    // Enhance participants with user data
    if (challenge.participants && Array.isArray(challenge.participants)) {
      if (challenge.participants.length > 0 && typeof challenge.participants[0] === 'object') {
        return challenge; // Already enhanced
      }

      const enhancedParticipants = await Promise.all(
        challenge.participants.map(async (uid: string) => {
          try {
            const userData = await userService.getUserById(uid);
            return {
              uid,
              email: userData?.email || 'Unknown',
              displayName: userData?.displayName || 'Unknown User'
            };
          } catch (error) {
            console.error(`Error fetching user ${uid}:`, error);
            return {
              uid,
              email: 'Unknown',
              displayName: 'Unknown User'
            };
          }
        })
      );

      return {
        ...challenge,
        participants: enhancedParticipants
      };
    }

    return challenge;
  },

  async create(challenge: Challenge): Promise<Challenge> {
    // Ensure participants are stored as UIDs in database
    const challengeToSave = { ...challenge };

    const challengeRef = push(ref(database, 'challenges'));
    await set(challengeRef, challengeToSave);
    return { id: challengeRef.key!, ...challenge };
  },

  async delete(id: string): Promise<void> {
    await remove(ref(database, `challenges/${id}`));
  },

  async addParticipant(challengeId: string, userId: string): Promise<void> {
    const challenge = await this.getById(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    // Get user data for the new participant
    const userData = await userService.getUserById(userId);
    const newParticipant: Participant = {
      uid: userId,
      email: userData?.email || 'Unknown',
      displayName: userData?.displayName || 'Unknown User'
    };

    // Check if user is already a participant
    const isAlreadyParticipant = challenge.participants.some(p => p.uid === userId);
    if (!isAlreadyParticipant) {
      const updatedParticipants = [...challenge.participants, newParticipant];
      // Store only UIDs in database
      await set(ref(database, `challenges/${challengeId}/participants`),
        updatedParticipants.map(p => p.uid)
      );
    }
  },

  async removeParticipant(challengeId: string, userId: string): Promise<void> {
    const challenge = await this.getById(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const updatedParticipants = challenge.participants.filter(p => p.uid !== userId);
    // Store only UIDs in database
    await set(ref(database, `challenges/${challengeId}/participants`),
      updatedParticipants.map(p => p.uid)
    );
  },
};

// === ENTRIES ===
export const entryService = {
  async getForChallenge(challengeId: string): Promise<Entry[]> {
    const snapshot = await get(ref(database, `entries/${challengeId}`));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data).map(([id, value]: any) => ({
      id,
      ...value,
    }));
  },

  async create(entry: Entry): Promise<void> {
    const entryRef = push(ref(database, `entries/${entry.challengeId}`));
    await set(entryRef, entry);
  },
};



// === USER SEARCH ===
export const userService = {
  async searchUsers(query: string): Promise<any[]> {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.entries(data)
      .map(([uid, userData]: any) => ({
        uid,
        ...userData,
      }))
      .filter(user =>
        user.displayName?.toLowerCase().includes(query.toLowerCase()) ||
        user.email?.toLowerCase().includes(query.toLowerCase())
      );
  },

  async getUserById(uid: string): Promise<any> {
    const snapshot = await get(ref(database, `users/${uid}`));
    if (!snapshot.exists()) return null;
    return { uid, ...snapshot.val() };
  },

  async createUserProfile(user: User, additionalData?: any): Promise<void> {
    await set(ref(database, `users/${user.uid}`), {
      email: user.email,
      displayName: user.displayName || additionalData?.name || user.email?.split('@')[0],
      createdAt: new Date().toISOString(),
      ...additionalData
    });
  }
};

// === CHALLENGE REQUESTS ===
export const challengeRequestService = {
  async sendChallengeRequest(fromUserId: string, toUserId: string, challengeId: string): Promise<void> {
    const requestRef = push(ref(database, 'challengeRequests'));
    await set(requestRef, {
      fromUserId,
      toUserId,
      challengeId,
      status: 'pending', // pending, accepted, rejected
      createdAt: new Date().toISOString()
    });
  },

  async getPendingRequests(userId: string): Promise<any[]> {
    const requestsRef = ref(database, 'challengeRequests');
    const snapshot = await get(requestsRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, request]: any) => ({
        id,
        ...request,
      }))
      .filter(request =>
        request.toUserId === userId && request.status === 'pending'
      );
  },

  async updateRequestStatus(requestId: string, status: 'accepted' | 'rejected'): Promise<void> {
    await set(ref(database, `challengeRequests/${requestId}/status`), status);
  },

  async getRequestById(requestId: string): Promise<any> {
    const snapshot = await get(ref(database, `challengeRequests/${requestId}`));
    if (!snapshot.exists()) return null;
    return { id: requestId, ...snapshot.val() };
  }
};

// === NOTIFICATIONS ===
export const notificationService = {
  async createNotification(userId: string, message: string, type: string, data?: any): Promise<void> {
    const notificationRef = push(ref(database, `notifications/${userId}`));
    await set(notificationRef, {
      message,
      type,
      data,
      read: false,
      createdAt: new Date().toISOString()
    });
  },

  async getUserNotifications(userId: string): Promise<any[]> {
    const notificationsRef = ref(database, `notifications/${userId}`);
    const snapshot = await get(notificationsRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, notification]: any) => ({
        id,
        ...notification,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await set(ref(database, `notifications/${userId}/${notificationId}/read`), true);
  },

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getUserNotifications(userId);
    const updates: any = {};

    notifications.forEach(notification => {
      if (!notification.read) {
        updates[`notifications/${userId}/${notification.id}/read`] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      await set(ref(database), updates);
    }
  }
};