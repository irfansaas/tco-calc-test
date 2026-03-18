'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { calculate, formatCurrency, formatPercentage } from '@/lib/calculations';
import { ServerIcon, CloudIcon, UsersIcon, FlameIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/icons';

export default function SimpleCalculator() {
  const [userCount, setUserCount] = useState<number>(600);
  const [showResults, setShowResults] = useState(false);
  const [showCostOfDelay, setShowCostOfDelay] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const result = showResults ? calculate({ userCount }) : null;

  const handleCalculate = () => {
    if (userCount < 10) return;
    setIsCalculating(true);
    setTimeout(() => {
      setShowResults(true);
      setIsCalculating(false);
    }, 300);
  };

  const handleReset = () => {
    setShowResults(false);
    setShowCostOfDelay(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="font-semibold text-gray-900">Nerdio</span>
            </div>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Full Calculator →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!showResults ? (
            /* INPUT FORM */
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How many Citrix users do you have?
              </h1>
              <p className="text-gray-500 mb-8">
                Enter your user count to see your potential savings
              </p>

              <div className="max-w-xs mx-auto mb-8">
                <input
                  type="number"
                  value={userCount || ''}
                  onChange={(e) => setUserCount(parseInt(e.target.value) || 0)}
                  placeholder="e.g., 600"
                  min={10}
                  max={100000}
                  className="w-full px-6 py-4 text-4xl font-bold text-center text-gray-900 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 placeholder:text-gray-400 placeholder:font-normal"
                />
                <p className="text-gray-400 mt-2">users</p>
              </div>

              <button
                onClick={handleCalculate}
                disabled={userCount < 10 || isCalculating}
                className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isCalculating ? 'Calculating...' : 'Show My Savings →'}
              </button>
            </motion.div>
          ) : (
            /* RESULTS */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <button
                onClick={handleReset}
                className="text-blue-600 hover:underline text-sm"
              >
                ← Calculate again
              </button>

              {/* Current State */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                    Current: On-Prem Citrix
                  </span>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(result!.infrastructure.physicalServersNeeded, 3) }).map((_, i) => (
                      <ServerIcon key={i} size={32} className="text-gray-600" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {result!.infrastructure.physicalServersNeeded} Physical Servers
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <UsersIcon size={20} />
                  <span>{userCount.toLocaleString()} Users</span>
                </div>

                <div className="border-t border-red-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Cost</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(result!.onPrem.totalMonthly)}/mo
                      </p>
                      <p className="text-sm text-red-500">
                        {formatCurrency(result!.onPrem.totalAnnual)}/yr
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Arrow */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl"
                >
                  ↓
                </motion.div>
              </div>

              {/* Future State */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-green-50 border-2 border-green-200 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                    Future: Azure + Nerdio
                  </span>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <CloudIcon size={32} className="text-blue-500" />
                  <div className="text-sm text-gray-600">
                    Azure AVD + Nerdio Manager
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <UsersIcon size={20} />
                  <span>{userCount.toLocaleString()} Users</span>
                </div>

                <div className="border-t border-green-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Cost</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(result!.cloud.totalMonthly)}/mo
                      </p>
                      <p className="text-sm text-green-500">
                        {formatCurrency(result!.cloud.totalAnnual)}/yr
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Savings Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white text-center shadow-xl"
              >
                <p className="text-green-100 text-sm mb-1">You Save</p>
                <p className="text-5xl font-bold mb-2">
                  {formatPercentage(result!.savings.percentage, 0)}
                </p>
                <p className="text-xl">
                  {formatCurrency(result!.savings.annualAmount)}/year
                </p>
                <p className="text-green-100">
                  {formatCurrency(result!.savings.monthlyAmount)}/month
                </p>
              </motion.div>

              {/* Cost of Delay Toggle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  onClick={() => setShowCostOfDelay(!showCostOfDelay)}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
                >
                  <FlameIcon size={20} />
                  <span>{showCostOfDelay ? 'Hide' : 'Show'} Cost of Delay</span>
                  {showCostOfDelay ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
                </button>

                <AnimatePresence>
                  {showCostOfDelay && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-red-50 border border-red-200 rounded-xl p-6"
                    >
                      <p className="text-center text-gray-600 mb-4">
                        Every day you wait costs you:
                      </p>
                      <p className="text-center text-4xl font-bold text-red-600 mb-4">
                        {formatCurrency(result!.costOfDelay.perDay, 2)}/day
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(result!.costOfDelay.perMonth, 0)}
                          </p>
                          <p className="text-xs text-gray-500">30 days</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(result!.costOfDelay.perMonth * 3, 0)}
                          </p>
                          <p className="text-xs text-gray-500">90 days</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(result!.costOfDelay.perYear, 0)}
                          </p>
                          <p className="text-xs text-gray-500">1 year</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center pt-4"
              >
                <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all">
                  Talk to a Specialist →
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400">
        Calculations are estimates based on typical deployments
      </footer>
    </div>
  );
}
