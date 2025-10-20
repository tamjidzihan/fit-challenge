import React from 'react';
const Footer: React.FC = () => {
  return <footer className="bg-white dark:bg-gray-800 shadow-inner py-6">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          © {new Date().getFullYear()} FitChallenge. All rights reserved.
        </p>
        <div className="mt-4 md:mt-0">
          <ul className="flex space-x-4">
            <li>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-sm">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-sm">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 text-sm">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>;
};
export default Footer;