import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, PlusIcon, XIcon } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { challengeService, userService } from '../services/firebase'
import { Input } from '../components/ui/Input'
import type { Challenge, Participant } from '../types'

function CreateChallenge() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [endDate, setEndDate] = useState('')
  const [fields, setFields] = useState<string[]>(['Steps'])
  const [newField, setNewField] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddField = () => {
    if (!newField.trim()) return
    if (fields.includes(newField.trim())) {
      setError('This field already exists')
      return
    }
    setFields([...fields, newField.trim()])
    setNewField('')
    setError('')
  }

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (fields.length === 0) {
      setError('You must add at least one tracking field')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Get current user data for the creator participant
      const currentUserData = await userService.getUserById(currentUser.uid);
      console.log(`current user name ${currentUser.displayName}`)

      const creatorParticipant: Participant = {
        uid: currentUser.uid,
        email: currentUserData?.email || currentUser.email || 'Unknown',
        displayName: currentUser.displayName || 'Unknown User'
      }

      const newChallenge: Challenge = {
        name,
        description,
        startDate,
        endDate,
        participants: [creatorParticipant],
        fields,
        creator: currentUser.uid,
      }

      const createdChallenge = await challengeService.create(newChallenge)
      navigate(`/challenges/${createdChallenge.id}`)
    } catch (error) {
      console.error('Error creating challenge:', error)
      setError('Failed to create challenge')
    } finally {
      setLoading(false)
    }
  }

  const calculateMinEndDate = () => {
    const minDate = new Date(startDate)
    minDate.setDate(minDate.getDate() + 1)
    return minDate.toISOString().split('T')[0]
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create New Challenge
        </h1>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Challenge Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 30-Day Step Challenge"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your challenge"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={calculateMinEndDate()}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              What do you want to track?
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-3 py-1 rounded-full flex items-center"
                >
                  <span>{field}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                placeholder="e.g., Steps, Miles, Workouts"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddField} variant="outline">
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            fullWidth
          >
            Create Challenge
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

export default CreateChallenge;

