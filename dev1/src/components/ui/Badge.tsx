import * as React from "react"

const Badge = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        variant?: 'default' | 'secondary' | 'success' | 'destructive'
    }
>(({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        destructive: 'bg-destructive text-destructive-foreground'
    }

    return (
        <div
            ref={ref}
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
            {...props}
        />
    )
})
Badge.displayName = "Badge"

export { Badge }