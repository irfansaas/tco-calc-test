'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AlertIcon, FlameIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/icons';
import { formatCurrency, CostOfDelay } from '@/lib/calculations';

interface CostOfDelayPanelProps {
  costOfDelay: CostOfDelay;
  isVisible: boolean;
  onToggle: () => void;
  isCloudCheaper?: boolean;
}

export default function CostOfDelayPanel({ costOfDelay, isVisible, onToggle, isCloudCheaper = true }: CostOfDelayPanelProps) {
  const [secondsOnPage, setSecondsOnPage] = useState(0);
  const [moneyLost, setMoneyLost] = useState(0);

  useEffect(() => {
    if (isVisible && isCloudCheaper) {
      const interval = setInterval(() => {
        setSecondsOnPage((prev) => {
          const newSeconds = prev + 1;
          setMoneyLost(newSeconds * costOfDelay.perSecond);
          return newSeconds;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible, costOfDelay.perSecond, isCloudCheaper]);

  // Reset counter when panel is closed
  useEffect(() => {
    if (!isVisible) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setSecondsOnPage(0);
      setMoneyLost(0);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [isVisible]);

  // Don't show cost of delay button if cloud is more expensive
  if (!isCloudCheaper) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={!isVisible ? { boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 0 10px rgba(239, 68, 68, 0)'] } : {}}
        transition={!isVisible ? { duration: 1.5, repeat: Infinity } : {}}
      >
        <FlameIcon size={20} />
        <span>{isVisible ? 'Hide' : 'Show'} Cost of Delay</span>
        {isVisible ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
      </motion.button>

      {/* Panel Content */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden mt-4"
          >
            <Card variant="bordered" className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 text-red-600 mb-2">
                  <AlertIcon size={24} />
                  <h3 className="text-xl font-bold">Cost of Delay</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  You&apos;re losing money every second you stay on Citrix
                </p>
              </div>

              {/* Live Counter */}
              <motion.div
                className="bg-white rounded-xl p-6 mb-6 shadow-inner border border-red-100"
                animate={{ boxShadow: ['inset 0 0 0 0 rgba(239, 68, 68, 0)', 'inset 0 0 20px 0 rgba(239, 68, 68, 0.1)'] }}
                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
              >
                <p className="text-center text-gray-500 text-sm mb-2">Since you opened this page:</p>
                <motion.p
                  className="text-center text-3xl sm:text-4xl md:text-5xl font-bold text-red-600"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {formatCurrency(moneyLost, 2)}
                </motion.p>
                <p className="text-center text-gray-400 text-xs mt-2">
                  ({secondsOnPage} seconds and counting...)
                </p>
              </motion.div>

              {/* Rate Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-lg p-3 text-center border border-red-100">
                  <p className="text-lg font-bold text-red-600">{formatCurrency(costOfDelay.perMinute, 2)}</p>
                  <p className="text-xs text-gray-500">per minute</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-red-100">
                  <p className="text-lg font-bold text-red-600">{formatCurrency(costOfDelay.perHour, 2)}</p>
                  <p className="text-xs text-gray-500">per hour</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-red-100">
                  <p className="text-lg font-bold text-red-600">{formatCurrency(costOfDelay.perDay, 0)}</p>
                  <p className="text-xs text-gray-500">per day</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-red-100">
                  <p className="text-lg font-bold text-red-600">{formatCurrency(costOfDelay.perMonth, 0)}</p>
                  <p className="text-xs text-gray-500">per month</p>
                </div>
              </div>

              {/* Projection Table */}
              <div className="bg-white rounded-xl p-4 border border-red-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">📅</span>
                  Projected Loss If You Wait:
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">30 days</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(costOfDelay.perMonth, 0)} lost
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">90 days (Quarter)</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(costOfDelay.perMonth * 3, 0)} lost
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">6 months</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(costOfDelay.perMonth * 6, 0)} lost
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">1 year</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(costOfDelay.perYear, 0)} lost
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6">
                <Button variant="danger" size="lg" fullWidth>
                  🚀 Start Saving Today
                </Button>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Schedule a 15-minute call with our team
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
