import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeftIcon } from 'lucide-react'

function TermsOfService() {
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
                    Terms of Service
                </h1>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            By accessing and using FitFrenzy, you accept and agree to be bound
                            by these Terms of Service. If you do not agree to these terms,
                            please do not use our service.
                        </p>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            2. User Accounts
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            When you create an account with us, you agree to:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>
                                Accept responsibility for all activities under your account
                            </li>
                            <li>Notify us immediately of any unauthorized use</li>
                        </ul>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            3. User Conduct
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                            You agree not to:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                            <li>Use the service for any illegal purpose</li>
                            <li>Submit false or misleading fitness data</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Attempt to gain unauthorized access to the service</li>
                            <li>Interfere with or disrupt the service</li>
                        </ul>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            4. Fitness Challenges
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            FitFrenzy provides a platform for tracking fitness challenges. We
                            do not provide medical advice, and you should consult with a
                            healthcare professional before starting any fitness program.
                            Participation in challenges is at your own risk.
                        </p>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            5. Intellectual Property
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            The FitFrenzy service and its original content, features, and
                            functionality are owned by FitFrenzy and are protected by
                            international copyright, trademark, and other intellectual
                            property laws.
                        </p>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            6. Termination
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            We may terminate or suspend your account and access to the service
                            immediately, without prior notice, for any reason, including
                            breach of these Terms of Service.
                        </p>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            7. Limitation of Liability
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            FitFrenzy shall not be liable for any indirect, incidental,
                            special, consequential, or punitive damages resulting from your
                            use of or inability to use the service.
                        </p>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            8. Changes to Terms
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            We reserve the right to modify these terms at any time. We will
                            notify users of any material changes. Your continued use of the
                            service after changes constitutes acceptance of the new terms.
                        </p>
                    </section>
                    <section className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                            9. Contact Information
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            If you have any questions about these Terms of Service, please
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


export default TermsOfService