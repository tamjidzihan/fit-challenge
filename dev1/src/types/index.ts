export interface Participant {
    uid: string;
    email: string;
    displayName: string;
}

export interface Challenge {
    id?: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    participants: Participant[];
    fields: string[];
    creator: string;
}

export interface Entry {
    id?: string;
    challengeId?: string;
    userId: string;
    date: string;
    values: Record<string, number | string>;
}

export interface ChallengeRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    challengeId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export interface Notification {
    id: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
    data?: {
        requestId?: string;
        challengeId?: string;
        fromUserId?: string;
    };
}