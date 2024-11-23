import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import PricingPage from './pages/PricingPage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import MagicLinkConfirmation from './pages/MagicLinkConfirmation';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import TransactionsPage from './pages/TransactionsPage';

function App() {
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {isDevMode && (
        <div className="bg-yellow-500 text-white text-center py-1 px-4 text-sm font-medium">
          Development Mode Enabled - All Pro Features Unlocked
        </div>
      )}
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/magic-link-confirmation" element={<MagicLinkConfirmation />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/:domain" element={<ResultsPage />} />
      </Routes>
    </div>
  );
}

export default App;