import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  return <div className="min-h-screen bg-black">
    <Navbar />
    <motion.main
      className="py-10 px-4 sm:px-6 lg:px-8"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      {children}
    </motion.main>
    <Footer />
  </div>;
};
export default Layout;