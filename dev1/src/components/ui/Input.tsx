import React, { forwardRef } from 'react'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helpText?: string
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helpText, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`w-full px-3 py-2 border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
                {helpText && !error && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {helpText}
                    </p>
                )}
            </div>
        )
    },
)
Input.displayName = 'Input'
