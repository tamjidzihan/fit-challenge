import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            © {new Date().getFullYear()} FitFrenzy. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-4">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-md">
            Created by{' '}
            <a
              href="https://tizdev.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              Md. Tamzid Islam.
            </a>
            <span> Made with <Heart className="h-4 w-4 text-red-500 inline-block" /></span>
          </p>
        </div>
      </div>
    </footer>
  )
}


export default Footer;