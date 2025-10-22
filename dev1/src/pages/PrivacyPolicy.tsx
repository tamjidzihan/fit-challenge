import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeftIcon } from 'lucide-react'

function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link
                    to="/"
                    className="inline-flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Back to Home
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Privacy Policy
                </h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            1. Information We Collect
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            FitFrenzy collects information that you provide directly to us
                            when you create an account, participate in challenges, or
                            communicate with us. This includes:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                            <li>Name and email address</li>
                            <li>Fitness activity data and challenge entries</li>
                            <li>Profile information</li>
                            <li>Communication preferences</li>
                        </ul>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            2. How We Use Your Information
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Track your progress in fitness challenges</li>
                            <li>Send you updates and notifications about your challenges</li>
                            <li>Respond to your comments and questions</li>
                            <li>Protect against fraudulent or illegal activity</li>
                        </ul>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            3. Information Sharing
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            We do not sell, trade, or otherwise transfer your personal
                            information to third parties. Your challenge data may be visible
                            to other participants in the same challenge, but we will never
                            share your information with external parties without your explicit
                            consent.
                        </p>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            4. Data Security
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            We implement appropriate security measures to protect your
                            personal information. However, no method of transmission over the
                            Internet is 100% secure, and we cannot guarantee absolute
                            security.
                        </p>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            5. Your Rights
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                            <li>Access and update your personal information</li>
                            <li>Delete your account and associated data</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Request a copy of your data</li>
                        </ul>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            6. Contact Us
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            If you have any questions about this Privacy Policy, please
                            contact us through our{' '}
                            <Link
                                to="/contact"
                                className="text-green-600 dark:text-green-400 hover:underline"
                            >
                                Contact page
                            </Link>
                            .
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    )
}

export default PrivacyPolicy