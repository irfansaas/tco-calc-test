'use client';

import { motion } from 'framer-motion';
import { CheckCircleIcon, AlertIcon } from '@/components/icons';
import { formatCurrency, formatPercentage, Savings, DeploymentMode } from '@/lib/calculations';

interface SavingsBannerProps {
  savings: Savings;
  deploymentMode?: DeploymentMode;
}

export default function SavingsBanner({ savings, deploymentMode = 'cloud' }: SavingsBannerProps) {
  const isPositiveSavings = savings.isCloudCheaper;
  const isHybrid = deploymentMode === 'hybrid';

  // Handle negative savings (cloud is more expensive)
  if (!isPositiveSavings) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.9, type: 'spring', bounce: 0.4 }}
        className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-center mb-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <AlertIcon size={32} className="text-white" />
          </motion.div>
        </div>

        <div className="text-center">
          <p className="text-amber-100 text-sm uppercase tracking-wider mb-1">Cloud Costs More</p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.2 }}
          >
            <span className="text-5xl md:text-6xl font-bold">
              +{formatPercentage(Math.abs(savings.percentage), 0)}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.4 }}
            className="mt-3 space-y-1"
          >
            <p className="text-xl font-semibold">
              {formatCurrency(Math.abs(savings.annualAmount))} more per year
            </p>
            <p className="text-amber-100">
              {formatCurrency(Math.abs(savings.monthlyAmount))} more per month
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.6 }}
            className="mt-4 text-sm text-amber-100"
          >
            Consider adjusting pricing assumptions or explore hybrid options
          </motion.p>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute -top-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        />
        <motion.div
          className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
        />
      </motion.div>
    );
  }

  // Positive savings (cloud is cheaper)
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.9, type: 'spring', bounce: 0.4 }}
      className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
    >
      <div className="flex items-center justify-center mb-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <CheckCircleIcon size={32} className="text-white" />
        </motion.div>
      </div>

      <div className="text-center">
        <p className="text-green-100 text-sm uppercase tracking-wider mb-1">
          {isHybrid ? 'Citrix License Savings' : 'You Save'}
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.2 }}
        >
          <span className="text-5xl md:text-6xl font-bold">
            {formatPercentage(savings.percentage, 0)}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.4 }}
          className="mt-3 space-y-1"
        >
          <p className="text-xl font-semibold">
            {formatCurrency(savings.annualAmount)} per year
          </p>
          <p className="text-green-100">
            {formatCurrency(savings.monthlyAmount)} per month
          </p>
        </motion.div>

        {isHybrid && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.6 }}
            className="mt-3 text-sm text-green-100"
          >
            By eliminating Citrix/Omnissa licensing with AVD Hybrid
          </motion.p>
        )}
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute -top-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      />
      <motion.div
        className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 1.6 }}
      />
    </motion.div>
  );
}
