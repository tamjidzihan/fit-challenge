import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { challengeRequestService, notificationService, userService } from '../../services/firebase';

function ChallengeRequestHandler() {
    const { currentUser } = useAuth();
    const [processedRequests, setProcessedRequests] = useState<Set<string>>(new Set());

    const checkPendingRequests = useCallback(async () => {
        if (!currentUser) return;

        try {
            const pendingRequests = await challengeRequestService.getPendingRequests(currentUser.uid);

            // Filter out already processed requests
            const newRequests = pendingRequests.filter(request =>
                !processedRequests.has(request.id)
            );

            // Create notifications for new pending requests
            for (const request of newRequests) {
                const fromUser = await userService.getUserById(request.fromUserId);
                if (fromUser) {
                    // Check if notification already exists for this request
                    const existingNotifications = await notificationService.getUserNotifications(currentUser.uid);
                    const alreadyNotified = existingNotifications.some(notif =>
                        notif.type === 'challenge_request' &&
                        notif.data?.requestId === request.id
                    );

                    if (!alreadyNotified) {
                        await notificationService.createNotification(
                            currentUser.uid,
                            `${fromUser.displayName} invited you to join a challenge!`,
                            'challenge_request',
                            {
                                requestId: request.id,
                                challengeId: request.challengeId,
                                fromUserId: request.fromUserId
                            }
                        );
                    }

                    // Mark as processed
                    setProcessedRequests(prev => new Set([...prev, request.id]));
                }
            }
        } catch (error) {
            console.error('Error checking pending requests:', error);
        }
    }, [currentUser, processedRequests]);

    useEffect(() => {
        if (currentUser) {
            checkPendingRequests();

            // Set up interval to check for new requests periodically
            const interval = setInterval(checkPendingRequests, 30000); // Check every 30 seconds

            return () => clearInterval(interval);
        }
    }, [currentUser, checkPendingRequests]);

    return null;
}

export default ChallengeRequestHandler;