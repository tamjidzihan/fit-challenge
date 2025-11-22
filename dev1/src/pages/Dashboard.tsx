import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  TrendingUpIcon,
  TrophyIcon,
  CalendarIcon,
  TargetIcon,
  BarChart3Icon,
  ClockIcon,
  SearchIcon,
  SparklesIcon,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import type { Challenge } from '../types'
import { challengeService, entryService } from '../services/firebase'
import ChallengeCard from '../components/dashboard/ChallengeCard'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Tabs, TabsContent } from '../components/ui/Tabs'
import { Progress } from '../components/ui/Progress'

interface DashboardStats {
  totalChallenges: number
  completedChallenges: number
  activeDays: number
  currentStreak: number
  totalEntries: number
}

function Dashboard() {
  const { currentUser } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all')
  const [stats, setStats] = useState<DashboardStats>({
    totalChallenges: 0,
    completedChallenges: 0,
    activeDays: 0,
    currentStreak: 0,
    totalEntries: 0
  })

  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentUser) return

      try {
        const allChallenges = await challengeService.getAll()
        const filteredChallenges = allChallenges.filter(
          (challenge) =>
            challenge.participants.some(p => p.uid === currentUser.uid) ||
            challenge.creator === currentUser.uid,
        )

        setChallenges(filteredChallenges)
        await calculateStats(filteredChallenges)
      } catch (error) {
        console.error('Error fetching challenges:', error)
      } finally {
        setLoading(false)
      }
    }

    async function calculateStats(userChallenges: Challenge[]) {
      if (!currentUser) return

      const today = new Date().toISOString().split('T')[0]
      const pastChallenges = userChallenges.filter(challenge => challenge.endDate < today)

      // Calculate total entries across all challenges
      let totalEntries = 0
      for (const challenge of userChallenges) {
        if (challenge.id) {
          const entries = await entryService.getForChallenge(challenge.id)
          totalEntries += entries.filter(entry => entry.userId === currentUser.uid).length
        }
      }

      // Calculate active days and streak (simplified)
      const activeDays = Math.min(totalEntries * 2, 30) // Mock calculation
      const currentStreak = Math.min(Math.floor(Math.random() * 15) + 1, 30) // Mock streak

      setStats({
        totalChallenges: userChallenges.length,
        completedChallenges: pastChallenges.length,
        activeDays,
        currentStreak,
        totalEntries
      })
    }

    fetchDashboardData()
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

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description?.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeFilter === 'active') {
      const today = new Date().toISOString().split('T')[0]
      return matchesSearch && challenge.startDate <= today && challenge.endDate >= today
    } else if (activeFilter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0]
      return matchesSearch && challenge.startDate > today
    } else if (activeFilter === 'past') {
      const today = new Date().toISOString().split('T')[0]
      return matchesSearch && challenge.endDate < today
    }

    return matchesSearch
  })

  const activeChallenges = getActiveChallenges()
  const upcomingChallenges = getUpcomingChallenges()
  const pastChallenges = getPastChallenges()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
        >
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Track your progress and stay motivated
            </p>
          </div>

          <Link to="/create-challenge">
            <Button className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Challenge
            </Button>
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : challenges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
              <TargetIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Begin Your Journey?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create your first challenge to start tracking your progress, achieve your goals, and compete with friends.
            </p>
            <Link to="/create-challenge">
              <Button className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Challenge
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Enhanced Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Active Challenges</p>
                      <h3 className="text-3xl font-bold mt-2">{activeChallenges.length}</h3>
                    </div>
                    <div className="p-3 rounded-full bg-white/20">
                      <TrendingUpIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={75} className="h-2 bg-white/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Current Streak</p>
                      <h3 className="text-3xl font-bold mt-2">{stats.currentStreak} days</h3>
                    </div>
                    <div className="p-3 rounded-full bg-white/20">
                      <ClockIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-green-100 text-sm">
                    Keep going! 🔥
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Completed</p>
                      <h3 className="text-3xl font-bold mt-2">{stats.completedChallenges}</h3>
                    </div>
                    <div className="p-3 rounded-full bg-white/20">
                      <TrophyIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-purple-100 text-sm">
                    {Math.round((stats.completedChallenges / stats.totalChallenges) * 100)}% success rate
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Total Entries</p>
                      <h3 className="text-3xl font-bold mt-2">{stats.totalEntries}</h3>
                    </div>
                    <div className="p-3 rounded-full bg-white/20">
                      <BarChart3Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-orange-100 text-sm">
                    Consistent tracking! 📊
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Search and Filter Section */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeFilter === 'all' ? 'primary' : 'outline'}
                  onClick={() => setActiveFilter('all')}
                  className="cursor-pointer flex-1 min-w-[80px] sm:flex-initial"
                >
                  All
                </Button>
                <Button
                  variant={activeFilter === 'active' ? 'primary' : 'outline'}
                  onClick={() => setActiveFilter('active')}
                  className="cursor-pointer flex-1 min-w-[80px] sm:flex-initial"
                >
                  Active
                </Button>
                <Button
                  variant={activeFilter === 'upcoming' ? 'primary' : 'outline'}
                  onClick={() => setActiveFilter('upcoming')}
                  className="cursor-pointer flex-1 min-w-[80px] sm:flex-initial"
                >
                  Upcoming
                </Button>
                <Button
                  variant={activeFilter === 'past' ? 'primary' : 'outline'}
                  onClick={() => setActiveFilter('past')}
                  className="cursor-pointer flex-1 min-w-[80px] sm:flex-initial"
                >
                  Completed
                </Button>
              </div>
            </motion.div>

            {/* Challenges Grid with Tabs */}
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="all" className="space-y-6">


                <TabsContent value="all" className="space-y-6">
                  <AnimatePresence>
                    {filteredChallenges.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredChallenges.map((challenge, index) => (
                          <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <ChallengeCard challenge={challenge} />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <TargetIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No challenges found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Try adjusting your search or filter criteria
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                {/* Individual tab contents for specific filters */}
                <TabsContent value="active">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeChallenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ChallengeCard challenge={challenge} />
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="upcoming">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {upcomingChallenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ChallengeCard challenge={challenge} />
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pastChallenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ChallengeCard challenge={challenge} />
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Recent Activity Section */}
            {(activeChallenges.length > 0 || pastChallenges.length > 0) && (
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Deadlines */}
                {activeChallenges.length > 0 && (
                  <Card className="bg-gray-800/80 backdrop-blur-sm  border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white gap-2">
                        <CalendarIcon className="h-5 w-5 text-orange-500" />
                        Upcoming Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {activeChallenges.slice(0, 3).map((challenge) => (
                        <div key={challenge.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50">
                          <div>
                            <p className="font-medium  text-white text-sm">{challenge.name}</p>
                            <p className="text-xs   text-gray-400">
                              Ends {new Date(challenge.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-2  text-white">
                            {Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Recent Completions */}
                {pastChallenges.length > 0 && (
                  <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white gap-2">
                        <TrophyIcon className="h-5 w-5 text-yellow-500" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pastChallenges.slice(0, 3).map((challenge) => (
                        <div key={challenge.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50">
                          <div>
                            <p className="font-medium text-white text-sm">{challenge.name}</p>
                            <p className="text-xs  text-gray-400">
                              Completed {new Date(challenge.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="success" className="ml-2">
                            Completed
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Dashboard