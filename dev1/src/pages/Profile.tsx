import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserIcon,
  CalendarIcon,
  MailIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  EditIcon,
  SaveIcon,
  XIcon,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { updateProfile } from 'firebase/auth'
import { useAuth } from '../hooks/useAuth'
import type { Challenge, Entry } from '../types'
import { challengeService, entryService } from '../services/firebase'

function Profile() {
  const { currentUser } = useAuth()
  const [isEditingName, setIsEditingName] = useState(false)
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) return
      try {
        setLoading(true)
        // Fetch all challenges
        const allChallenges = await challengeService.getAll()
        // Filter challenges for current user
        const userChallenges = allChallenges.filter(
          (challenge) =>
            challenge.participants.some(p => p.uid === currentUser.uid) ||
            challenge.creator === currentUser.uid,
        )
        setChallenges(userChallenges)

        // Fetch all entries and filter for current user
        const allEntriesPromises = userChallenges
          .filter((ch) => !!ch.id)
          .map((ch) => entryService.getForChallenge(ch.id!))
        const allEntriesArrays = await Promise.all(allEntriesPromises)
        const userEntries = allEntriesArrays
          .flat()
          .filter((entry) => entry.userId === currentUser.uid)
        setEntries(userEntries)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load your profile data')
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [currentUser])

  const handleUpdateName = async () => {
    if (!currentUser) return
    if (!displayName.trim()) {
      setError('Display name cannot be empty')
      return
    }
    try {
      await updateProfile(currentUser, { displayName: displayName.trim() })
      setSuccess('Display name updated successfully')
      setTimeout(() => setSuccess(''), 3000)
      setIsEditingName(false)
    } catch (err) {
      console.error('Error updating display name:', err)
      setError('Failed to update display name')
      setTimeout(() => setError(''), 3000)
    }
  }

  const cancelEdit = () => {
    setDisplayName(currentUser?.displayName || '')
    setIsEditingName(false)
  }

  const getActiveChallenges = () => {
    const today = new Date().toISOString().split('T')[0]
    return challenges.filter(
      (challenge) => challenge.startDate <= today && challenge.endDate >= today,
    )
  }

  const getCompletedChallenges = () => {
    const today = new Date().toISOString().split('T')[0]
    return challenges.filter((challenge) => challenge.endDate < today)
  }

  const getRecentEntries = () => {
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          You must be logged in to view your profile
        </h2>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        My Profile
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 rounded">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-4 rounded">
              <p className="text-green-700 dark:text-green-300">{success}</p>
            </div>
          )}

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>
              {!isEditingName && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                >
                  <EditIcon className="w-4 h-4 mr-2" />
                  Edit Name
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-4">
                  <UserIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                {isEditingName ? (
                  <div className="flex-1">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Display Name"
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdateName}>
                        <SaveIcon className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <XIcon className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Name
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currentUser.displayName}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-4">
                  <MailIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-4">
                  <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Joined
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(currentUser.metadata.creationTime || new Date().toISOString())}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <TrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Active Challenges
                  </p>
                  <h3 className="font-bold text-2xl text-gray-900 dark:text-white">
                    {getActiveChallenges().length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <CheckCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Completed Challenges
                  </p>
                  <h3 className="font-bold text-2xl text-gray-900 dark:text-white">
                    {getCompletedChallenges().length}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <ClipboardCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Total Entries
                  </p>
                  <h3 className="font-bold text-2xl text-gray-900 dark:text-white">
                    {entries.length}
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>
            {getRecentEntries().length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity to show. Start tracking your challenges!
              </p>
            ) : (
              <div className="space-y-4">
                {getRecentEntries().map((entry) => {
                  const challenge = challenges.find(
                    (c) => c.id === entry.challengeId,
                  )
                  return (
                    <div
                      key={entry.id}
                      className="border-l-4 border-green-500 pl-4 py-2"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">
                        {challenge?.name || 'Unknown Challenge'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(entry.date)}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Object.entries(entry.values).map(([field, value]) => (
                          <span
                            key={field}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          >
                            {field}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}


export default Profile;