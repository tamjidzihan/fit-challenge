import { useState, useEffect, useCallback } from 'react';
import { BellIcon, CheckIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { notificationService, challengeRequestService, challengeService, database } from '../../services/firebase';
import { Button } from '../ui/Button';
import type { Notification } from '../../types/index';
import { ref, set } from 'firebase/database';

function NotificationBell() {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [processingRequest, setProcessingRequest] = useState<string | null>(null);

    const loadNotifications = useCallback(async () => {
        if (!currentUser) return;
        try {
            setLoading(true);
            const userNotifications = await notificationService.getUserNotifications(currentUser.uid);
            setNotifications(userNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            loadNotifications();
        }
    }, [currentUser, loadNotifications]);

    const handleMarkAsRead = async (notificationId: string) => {
        if (!currentUser) return;
        try {
            await notificationService.markAsRead(notificationId, currentUser.uid);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!currentUser) return;
        try {
            await notificationService.markAllAsRead(currentUser.uid);
            setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleChallengeRequest = async (notification: Notification, accept: boolean) => {
        if (!currentUser || !notification.data?.requestId) return;

        setProcessingRequest(notification.id);
        try {
            // Update the challenge request status
            await challengeRequestService.updateRequestStatus(
                notification.data.requestId,
                accept ? 'accepted' : 'rejected'
            );

            if (accept && notification.data.challengeId) {
                // Add current user to the challenge participants
                const challenge = await challengeService.getById(notification.data.challengeId);
                if (challenge && !challenge.participants.includes(currentUser.uid)) {
                    const updatedParticipants = [...challenge.participants, currentUser.uid];
                    await set(ref(database, `challenges/${challenge.id}/participants`), updatedParticipants);

                    // Create a success notification
                    await notificationService.createNotification(
                        currentUser.uid,
                        `You've joined the challenge "${challenge.name}"!`,
                        'challenge_joined',
                        { challengeId: challenge.id }
                    );

                    // Notify the challenge creator
                    if (notification.data.fromUserId) {
                        await notificationService.createNotification(
                            notification.data.fromUserId,
                            `${currentUser.displayName} accepted your challenge invitation!`,
                            'challenge_accepted',
                            { challengeId: challenge.id, acceptedUserId: currentUser.uid }
                        );
                    }
                }
            } else if (!accept && notification.data.fromUserId) {
                // Notify the sender that the request was declined
                await notificationService.createNotification(
                    notification.data.fromUserId,
                    `${currentUser.displayName} declined your challenge invitation.`,
                    'challenge_declined',
                    { challengeId: notification.data.challengeId }
                );
            }

            // Mark the original notification as read and remove it
            await handleMarkAsRead(notification.id);
            setNotifications(prev => prev.filter(n => n.id !== notification.id));

        } catch (error) {
            console.error('Error handling challenge request:', error);
        } finally {
            setProcessingRequest(null);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="relative cursor-pointer"
            >
                <BellIcon className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs cursor-pointer"
                                    >
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center">Loading...</div>
                            ) : notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-gray-100 dark:border-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm text-gray-900 dark:text-white flex-1">
                                                {notification.message}
                                            </p>
                                            {!notification.read && notification.type !== 'challenge_request' && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="ml-2 cursor-pointer"
                                                >
                                                    <CheckIcon className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Challenge Request Actions */}
                                        {notification.type === 'challenge_request' && !notification.read && (
                                            <div className="flex gap-2 mt-3">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleChallengeRequest(notification, true)}
                                                    disabled={processingRequest === notification.id}
                                                    className="cursor-pointer flex-1"
                                                >
                                                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                    {processingRequest === notification.id ? 'Accepting...' : 'Accept'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleChallengeRequest(notification, false)}
                                                    disabled={processingRequest === notification.id}
                                                    className="cursor-pointer flex-1"
                                                >
                                                    <XCircleIcon className="w-3 h-3 mr-1" />
                                                    {processingRequest === notification.id ? 'Declining...' : 'Decline'}
                                                </Button>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default NotificationBell;