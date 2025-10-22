import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, MailIcon, SendIcon } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [submitted, setSubmitted] = useState(false)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, this would send the form data to a server
        console.log('Contact form submitted:', formData)
        setSubmitted(true)
        setTimeout(() => {
            setSubmitted(false)
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
            })
        }, 3000)
    }
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }
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
                <div className="flex items-center mb-6">
                    <MailIcon className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Contact Us
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Have a question or feedback? We would love to hear from you. Fill out
                    the form below and we will get back to you as soon as possible.
                </p>
                {submitted && (
                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-6">
                        <p className="text-green-700 dark:text-green-300">
                            Thank you for your message! We will get back to you soon.
                        </p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Input
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div>
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Input
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="What is this about?"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Message
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us more..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={6}
                            required
                        />
                    </div>
                    <Button type="submit" fullWidth>
                        <SendIcon className="w-4 h-4 mr-2" />
                        Send Message
                    </Button>
                </form>
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Other Ways to Reach Us
                    </h3>
                    <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Creator:</span>{' '}
                            <a
                                href="https://tizdev.netlify.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 dark:text-green-400 hover:underline"
                            >
                                Md. Tamzid Islam
                            </a>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Email:</span>{' '}
                            <a
                                href="mailto:support@fitfrenzy.com"
                                className="text-green-600 dark:text-green-400 hover:underline"
                            >
                                support@fitfrenzy.com
                            </a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}


export default Contact