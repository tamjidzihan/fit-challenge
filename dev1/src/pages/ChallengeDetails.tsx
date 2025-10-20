import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  UsersIcon,
  PlusIcon,
  ChevronLeftIcon,
  TrashIcon,
  LineChartIcon,
  BarChart3Icon,
  UserIcon,
  XIcon
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { challengeService, entryService } from '../services/firebase'
import type { Challenge, Entry, Participant } from '../types'
import UserSearch from '../components/challenges/UserSearch'
import ProgressGraph from '../components/challenges/ProgressGraph'

function ChallengeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [entryValues, setEntryValues] = useState<Record<string, number | string>>({})
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])

  useEffect(() => {
    async function fetchChallengeData() {
      if (!id || !currentUser) return
      try {
        const challengeData = await challengeService.getById(id)
        if (!challengeData) {
          navigate('/')
          return
        }
        setChallenge(challengeData)

        // Initialize entry values
        const initialValues: Record<string, number | string> = {}
        challengeData.fields.forEach((field) => {
          initialValues[field] = ''
        })
        setEntryValues(initialValues)

        // Fetch entries
        const entriesData = await entryService.getForChallenge(id)
        setEntries(entriesData)

        // Set participants from challenge data (already enhanced with user data)
        setParticipants(challengeData.participants || [])
      } catch (error) {
        console.error('Error fetching challenge:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchChallengeData()
  }, [id, currentUser, navigate])

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!challenge || !currentUser) return
    try {
      const newEntry: Omit<Entry, 'id'> = {
        challengeId: challenge.id,
        userId: currentUser.uid,
        date: entryDate,
        values: entryValues,
      }
      await entryService.create(newEntry)
      // Refresh entries
      const updatedEntries = await entryService.getForChallenge(challenge.id!)
      setEntries(updatedEntries)
      // Reset form
      setShowEntryForm(false)
      const initialValues: Record<string, number | string> = {}
      challenge.fields.forEach((field) => {
        initialValues[field] = ''
      })
      setEntryValues(initialValues)
      setEntryDate(new Date().toISOString().split('T')[0])
    } catch (error) {
      console.error('Error creating entry:', error)
    }
  }

  const handleValueChange = (field: string, value: string) => {
    setEntryValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDeleteChallenge = async () => {
    if (!challenge || !currentUser || currentUser.uid !== challenge.creator) return
    if (window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      try {
        if (typeof challenge.id === 'string') {
          await challengeService.delete(challenge.id)
          navigate('/')
        } else {
          throw new Error('Challenge ID is invalid.')
        }
      } catch (error) {
        console.error('Error deleting challenge:', error)
      }
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    if (!challenge || !currentUser) return

    // Only creator can remove participants, or users can remove themselves
    const canRemove = currentUser.uid === challenge.creator || currentUser.uid === participantId
    if (!canRemove) return

    if (window.confirm('Are you sure you want to remove this participant?')) {
      try {
        await challengeService.removeParticipant(challenge.id!, participantId)

        // Refresh challenge data
        const updatedChallenge = await challengeService.getById(challenge.id!)
        if (updatedChallenge) {
          setChallenge(updatedChallenge)
          setParticipants(updatedChallenge.participants || [])
        }

        // If user removed themselves, navigate to dashboard
        if (currentUser.uid === participantId) {
          navigate('/')
        }
      } catch (error) {
        console.error('Error removing participant:', error)
      }
    }
  }


  const getAllEntriesGroupedByDate = () => {
    const grouped: { [date: string]: { [userId: string]: Entry } } = {}

    entries.forEach(entry => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = {}
      }
      grouped[entry.date][entry.userId] = entry
    })

    return grouped
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }


  const isActive = () => {
    const today = new Date().toISOString().split('T')[0]
    return challenge!.startDate <= today && challenge!.endDate >= today
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Challenge not found
        </h2>
        <Link
          to="/"
          className="mt-4 inline-block text-green-600 hover:underline"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const allEntriesGrouped = getAllEntriesGroupedByDate()
  const sortedDates = Object.keys(allEntriesGrouped).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {challenge.name}
              </h1>
              <div className="mt-4 space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  <span>
                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <UsersIcon className="w-5 h-5 mr-2" />
                  <span>{participants.length} participants</span>
                </div>
              </div>

              {challenge.description && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Description
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {challenge.description}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Participants ({participants.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.uid}
                      className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg group relative"
                    >
                      <UserIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {participant.displayName}
                        {participant.uid === challenge.creator && ' (Creator)'}
                        {participant.uid === currentUser?.uid && ' (You)'}
                      </span>

                      {/* Remove participant button - only show for creator or self */}
                      {(currentUser?.uid === challenge.creator || currentUser?.uid === participant.uid) && participant.uid !== challenge.creator && (
                        <button
                          onClick={() => handleRemoveParticipant(participant.uid)}
                          className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title={currentUser.uid === participant.uid ? "Leave challenge" : "Remove participant"}
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {currentUser && challenge.creator === currentUser.uid && isActive() && (
                <div className="mt-6">
                  <Button
                    className='cursor-pointer'
                    variant="outline"
                    onClick={() => setShowUserSearch(!showUserSearch)}
                  >
                    <UsersIcon className="w-4 h-4 mr-2" />
                    {showUserSearch ? 'Hide User Search' : 'Invite Users'}
                  </Button>

                  {showUserSearch && (
                    <div className="mt-4">
                      <UserSearch
                        challengeId={challenge.id!}
                        onRequestSent={() => {
                          // Optional: Show success message or refresh data
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {isActive() && (
                <Button
                  className='cursor-pointer'
                  onClick={() => setShowEntryForm(true)}
                  disabled={showEntryForm}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              )}
              {currentUser && challenge.creator === currentUser.uid && (
                <Button className='cursor-pointer' variant="danger" onClick={handleDeleteChallenge}>
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Challenge
                </Button>
              )}
            </div>
          </div>

          {showEntryForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Add New Entry
              </h3>
              <form onSubmit={handleEntrySubmit} className="space-y-4">
                <div>
                  <Input
                    label="Date"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    min={challenge.startDate}
                    required
                  />
                </div>
                {challenge.fields.map((field) => (
                  <div key={field}>
                    <Input
                      label={field}
                      type="number"
                      value={entryValues[field] as string}
                      onChange={(e) => handleValueChange(field, e.target.value)}
                      required
                      placeholder={`Enter your ${field.toLowerCase()}`}
                      min="0"
                      step="any"
                    />
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button className='cursor-pointer' type="submit">Save Entry</Button>
                  <Button
                    type="button"
                    variant="outline"
                    className='cursor-pointer'
                    onClick={() => setShowEntryForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* All Participants Entries Table */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                All Participants Entries
              </h2>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <LineChartIcon className="w-5 h-5 mr-1" />
                <span>{entries.length} total entries</span>
              </div>
            </div>

            {entries.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No entries have been logged for this challenge yet.
                  {isActive() && ' Add your first entry to start tracking progress!'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      {participants.map((participant) => (
                        <th
                          key={participant.uid}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {participant.displayName}
                          {participant.uid === currentUser?.uid && ' (You)'}
                          {participant.uid === challenge.creator && ' ★'}
                        </th>
                      ))}

                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedDates.map((date) => (
                      <tr key={date}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(date)}
                        </td>
                        {participants.map((participant) => {
                          const userEntry = allEntriesGrouped[date]?.[participant.uid]
                          return (
                            <td
                              key={`${date}-${participant.uid}`}
                              className="px-4 py-4 text-sm text-gray-900 dark:text-white"
                            >
                              {userEntry ? (
                                <div className="space-y-1">
                                  {challenge.fields.map((field) => (
                                    <div key={field} className="flex justify-between">
                                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                                        {field}:
                                      </span>
                                      <span className="font-medium">
                                        {userEntry.values[field]}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-xs">
                                  No entry
                                </span>
                              )}
                            </td>
                          )
                        })}

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Progress Graph */}
          <div className="mt-10">
            <div className="flex items-center mb-4">
              <BarChart3Icon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Progress Graph
              </h2>
            </div>
            <ProgressGraph
              challenge={challenge}
              entries={entries}
              userId={currentUser?.uid}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChallengeDetail