/**
 * Main App component with routing configuration
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { Homepage } from './pages/Homepage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CompanyDetails } from './pages/CompanyDetails';
import { OurTeam } from './pages/OurTeam';
import { University } from './pages/University';
import { InvestorRelations } from './pages/InvestorRelations';
import { Documents } from './pages/Documents';
import { HelpCenter } from './pages/HelpCenter';
import { Community } from './pages/Community';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { RequestAccess } from './pages/RequestAccess';
import { Newsletter } from './pages/Newsletter';
import { BridgeObserver } from './pages/BridgeObserver';

// Page transition wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

// Animated routes component
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Homepage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/request-access" element={<PageTransition><RequestAccess /></PageTransition>} />
        <Route path="/bridge-observer" element={<PageTransition><BridgeObserver /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/company/:symbol" element={<PageTransition><CompanyDetails /></PageTransition>} />
        <Route path="/our-team" element={<PageTransition><OurTeam /></PageTransition>} />
        <Route path="/university" element={<PageTransition><University /></PageTransition>} />
        <Route path="/investor-relations" element={<PageTransition><InvestorRelations /></PageTransition>} />
        <Route path="/documents" element={<PageTransition><Documents /></PageTransition>} />
        <Route path="/help-center" element={<PageTransition><HelpCenter /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/newsletter" element={<PageTransition><Newsletter /></PageTransition>} />
        <Route path="/features" element={<PageTransition><Features /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <div className="bg-gray-50 dark:bg-[#0b0c0f]">
            <AnimatedRoutes />
            <Analytics />
          </div>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;

