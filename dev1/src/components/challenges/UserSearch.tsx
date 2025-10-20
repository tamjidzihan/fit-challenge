import React, { useState } from 'react';
import { SearchIcon, UserPlusIcon, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { userService, challengeRequestService, notificationService } from '../../services/firebase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface UserSearchProps {
    challengeId: string;
    onRequestSent?: () => void;
}

// Define the user type for search results
interface SearchUser {
    uid: string;
    displayName: string;
    email: string;
}

function UserSearch({ challengeId, onRequestSent }: UserSearchProps) {
    const { currentUser } = useAuth();
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [successMessage, setSuccessMessage] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const results = await userService.searchUsers(query);
            // Filter out current user and ensure proper typing
            const filteredResults = results
                .filter(user => user.uid !== currentUser?.uid)
                .map(user => ({
                    uid: user.uid,
                    displayName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
                    email: user.email || 'No email'
                }));
            setSearchResults(filteredResults);
            setSearchPerformed(true);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendChallenge = async (toUserId: string, toUserName: string) => {
        if (!currentUser || sentRequests.has(toUserId)) return;

        try {
            // Mark as sent immediately for better UX
            setSentRequests(prev => new Set([...prev, toUserId]));

            await challengeRequestService.sendChallengeRequest(
                currentUser.uid,
                toUserId,
                challengeId
            );

            // Create notification for the recipient
            await notificationService.createNotification(
                toUserId,
                `${currentUser.displayName || 'Someone'} invited you to join a challenge!`,
                'challenge_request',
                {
                    challengeId,
                    fromUserId: currentUser.uid
                }
            );

            // Show success message
            setSuccessMessage(`Invitation sent to ${toUserName}!`);
            setTimeout(() => setSuccessMessage(''), 3000);

            if (onRequestSent) {
                onRequestSent();
            }

            // Remove user from search results after a short delay
            setTimeout(() => {
                setSearchResults(prev => prev.filter(user => user.uid !== toUserId));
                // Remove from sent requests after they disappear from UI
                setSentRequests(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(toUserId);
                    return newSet;
                });
            }, 1000);

        } catch (error) {
            console.error('Error sending challenge request:', error);
            // Remove from sent requests on error
            setSentRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(toUserId);
                return newSet;
            });
        }
    };

    const clearSearch = () => {
        setQuery('');
        setSearchResults([]);
        setSearchPerformed(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Invite Users to Challenge
            </h3>

            {/* Success Message */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-3 rounded-md mb-4 flex items-center"
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {successMessage}
                </motion.div>
            )}

            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1"
                />
                <Button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className='cursor-pointer'
                >
                    <SearchIcon className="w-4 h-4 mr-2" />
                    {loading ? 'Searching...' : 'Search'}
                </Button>
                {searchPerformed && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={clearSearch}
                        className='cursor-pointer'
                    >
                        Clear
                    </Button>
                )}
            </form>

            {loading && (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                </div>
            )}

            {searchPerformed && !loading && (
                <div className="space-y-3">
                    {searchResults.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No users found
                        </p>
                    ) : (
                        searchResults.map((user) => {
                            const isSent = sentRequests.has(user.uid);
                            return (
                                <motion.div
                                    key={user.uid}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${isSent
                                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                            : 'bg-gray-50 dark:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {user.displayName}
                                            {isSent && (
                                                <span className="ml-2 text-green-600 dark:text-green-400 text-sm">
                                                    ✓ Invited
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.email}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSendChallenge(user.uid, user.displayName)}
                                        disabled={isSent}
                                        className={`cursor-pointer ${isSent ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isSent ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Sent
                                            </>
                                        ) : (
                                            <>
                                                <UserPlusIcon className="w-4 h-4 mr-1" />
                                                Invite
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Help text */}
            {!searchPerformed && !loading && (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                    Enter a name or email address to search for users
                </div>
            )}
        </div>
    );
}

export default UserSearch;