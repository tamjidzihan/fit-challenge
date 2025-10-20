import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import type { Challenge } from '../../types';


function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const startDate = new Date(challenge.startDate).toLocaleDateString()
  const endDate = new Date(challenge.endDate).toLocaleDateString()
  const isActive = () => {
    const today = new Date().toISOString().split('T')[0]
    return challenge.startDate <= today && challenge.endDate >= today
  }
  const isUpcoming = () => {
    const today = new Date().toISOString().split('T')[0]
    return challenge.startDate > today
  }
  let statusColor = 'bg-purple-100 text-purple-800'
  let statusText = 'Completed'
  if (isActive()) {
    statusColor = 'bg-green-100 text-green-800'
    statusText = 'Active'
  } else if (isUpcoming()) {
    statusColor = 'bg-blue-100 text-blue-800'
    statusText = 'Upcoming'
  }
  return (
    <motion.div
      whileHover={{
        y: -5,
      }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {challenge.name}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}
          >
            {statusText}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {startDate} - {endDate}
        </p>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tracking:
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {challenge.fields.map((field, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <Link to={`/challenges/${challenge.id}`}>
            <Button className=' cursor-pointer' variant="outline" fullWidth>
              View Challenge
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
export default ChallengeCard;