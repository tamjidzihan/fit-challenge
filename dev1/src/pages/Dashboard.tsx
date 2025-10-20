import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  TrendingUpIcon,
  UsersIcon,
  ClipboardCheckIcon,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import type { Challenge } from '../types'
import { challengeService } from '../services/firebase'
import ChallengeCard from '../components/dashboard/ChallengeCard'


function Dashboard() {
  const { currentUser } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchChallenges() {
      if (!currentUser) return
      try {
        const allChallenges = await challengeService.getAll()
        // Filter challenges for current user
        const filteredChallenges = allChallenges.filter(
          (challenge) =>
            challenge.participants.includes(currentUser.uid) ||
            challenge.creator === currentUser.uid,
        )
        setChallenges(filteredChallenges)
      } catch (error) {
        console.error('Error fetching challenges:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchChallenges()
  }, [currentUser])
  const getActiveChallenges = () => {
    const today = new Date().toISOString().split('T')[0]
    return challenges.filter(
      (challenge) => challenge.startDate <= today && challenge.endDate >= today,
    )
  }
  const getUpcomingChallenges = () => {
    const today = new Date().toISOString().split('T')[0]
    return challenges.filter((challenge) => challenge.startDate > today)
  }
  const getPastChallenges = () => {
    const today = new Date().toISOString().split('T')[0]
    return challenges.filter((challenge) => challenge.endDate < today)
  }
  const activeChallenges = getActiveChallenges()
  const upcomingChallenges = getUpcomingChallenges()
  const pastChallenges = getPastChallenges()
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <Link to="/create-challenge">
          <Button className=' cursor-pointer'>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Challenge
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No challenges yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first challenge to start tracking your progress
          </p>
          <Link to="/create-challenge">
            <Button className=' cursor-pointer'>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{
                y: -5,
              }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <TrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Active Challenges
                  </p>
                  <h3 className="font-bold text-2xl text-gray-900 dark:text-white">
                    {activeChallenges.length}
                  </h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{
                y: -5,
              }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <ClipboardCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Upcoming Challenges
                  </p>
                  <h3 className="font-bold text-2xl text-gray-900 dark:text-white">
                    {upcomingChallenges.length}
                  </h3>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{
                y: -5,
              }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <UsersIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Completed Challenges
                  </p>
                  <h3 className="font-bold text-2xl text-gray-900 dark:text-white">
                    {pastChallenges.length}
                  </h3>
                </div>
              </div>
            </motion.div>
          </div>
          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Active Challenges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            </div>
          )}
          {/* Upcoming Challenges */}
          {upcomingChallenges.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Upcoming Challenges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            </div>
          )}
          {/* Past Challenges */}
          {pastChallenges.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Past Challenges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default Dashboard;