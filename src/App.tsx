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
import { Documentation } from './pages/Documentation';
import { HelpCenter } from './pages/HelpCenter';
import { Community } from './pages/Community';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { RequestAccess } from './pages/RequestAccess';
import { Backtesting } from './pages/Backtesting';
import { Strategy } from './pages/Strategy';
import { RiskManagement } from './pages/RiskManagement';
import { Execution } from './pages/Execution';
import { Automation } from './pages/Automation';
import { Performance } from './pages/Performance';

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
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/company/:symbol" element={<PageTransition><CompanyDetails /></PageTransition>} />
        <Route path="/our-team" element={<PageTransition><OurTeam /></PageTransition>} />
        <Route path="/documentation" element={<PageTransition><Documentation /></PageTransition>} />
        <Route path="/help-center" element={<PageTransition><HelpCenter /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/features" element={<PageTransition><Features /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/backtesting" element={<PageTransition><Backtesting /></PageTransition>} />
        <Route path="/strategy" element={<PageTransition><Strategy /></PageTransition>} />
        <Route path="/risk-management" element={<PageTransition><RiskManagement /></PageTransition>} />
        <Route path="/execution" element={<PageTransition><Execution /></PageTransition>} />
        <Route path="/automation" element={<PageTransition><Automation /></PageTransition>} />
        <Route path="/performance" element={<PageTransition><Performance /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <div className="bg-gray-50 dark:bg-[#0a0a0a]">
            <AnimatedRoutes />
            <Analytics />
          </div>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;

