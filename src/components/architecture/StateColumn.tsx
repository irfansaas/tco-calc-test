'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import {
  ServerIcon,
  CloudIcon,
  CitrixIcon,
  NerdioIcon,
  UsersIcon,
  LicenseIcon,
  WindowsIcon,
} from '@/components/icons';
import { formatCurrency } from '@/lib/calculations';
import { OnPremCosts, CloudCosts, InfrastructureDetails } from '@/lib/calculations';

interface CostItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  cost: number;
  period: 'year' | 'month';
  variant: 'current' | 'future';
  delay?: number;
}

function CostItem({ icon, label, description, cost, period, variant, delay = 0 }: CostItemProps) {
  const textColors = {
    current: 'text-red-600',
    future: 'text-green-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: variant === 'current' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center space-x-3 py-3"
    >
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <div className="text-right">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
          className={`text-sm font-bold ${textColors[variant]}`}
        >
          {formatCurrency(cost)}
        </motion.p>
        <p className="text-xs text-gray-500">/{period === 'year' ? 'yr' : 'mo'}</p>
      </div>
    </motion.div>
  );
}

interface CurrentStateColumnProps {
  infrastructure: InfrastructureDetails;
  costs: OnPremCosts;
  userCount: number;
}

export function CurrentStateColumn({ infrastructure, costs, userCount }: CurrentStateColumnProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="current" className="h-full">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-red-700 bg-red-200 rounded-full uppercase tracking-wide">
            Current State
          </span>
          <h3 className="mt-2 text-lg font-bold text-gray-900">On-Prem Citrix</h3>
        </div>

        {/* Architecture Visualization */}
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="flex space-x-1 mb-2">
              {Array.from({ length: Math.min(infrastructure.physicalServersNeeded, 5) }).map((_, i) => (
                <ServerIcon key={i} size={28} className="text-gray-600" />
              ))}
              {infrastructure.physicalServersNeeded > 5 && (
                <span className="text-xs text-gray-500 self-center">+{infrastructure.physicalServersNeeded - 5}</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{infrastructure.physicalServersNeeded} Physical Servers</p>
          </motion.div>
        </div>

        <div className="divide-y divide-red-200">
          <CostItem
            icon={<CitrixIcon size={24} />}
            label="Citrix License"
            description={`${infrastructure.concurrentUsers} concurrent users`}
            cost={costs.citrixLicense}
            period="year"
            variant="current"
            delay={0.3}
          />
          <CostItem
            icon={<LicenseIcon size={24} className="text-gray-600" />}
            label="RDS CALs"
            description={`${userCount} user licenses`}
            cost={costs.rdsCalLicense}
            period="year"
            variant="current"
            delay={0.4}
          />
          {costs.windowsServerLicense > 0 && (
            <CostItem
              icon={<WindowsIcon size={24} />}
              label="Windows Server"
              description="Datacenter license"
              cost={costs.windowsServerLicense}
              period="year"
              variant="current"
              delay={0.5}
            />
          )}
        </div>

        {/* Users */}
        <div className="mt-4 pt-4 border-t border-red-200">
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
            <UsersIcon size={20} />
            <span className="text-sm">{userCount} Users</span>
          </div>
        </div>

        {/* Total */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-4 pt-4 border-t-2 border-red-300 bg-red-100 -mx-6 -mb-6 px-6 py-4 rounded-b-xl"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Cost</span>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{formatCurrency(costs.totalAnnual)}/yr</p>
              <p className="text-sm text-red-500">{formatCurrency(costs.totalMonthly)}/mo</p>
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}

interface FutureStateColumnProps {
  infrastructure: InfrastructureDetails;
  costs: CloudCosts;
  userCount: number;
}

export function FutureStateColumn({ infrastructure, costs, userCount }: FutureStateColumnProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card variant="future" className="h-full">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-green-700 bg-green-200 rounded-full uppercase tracking-wide">
            Future State
          </span>
          <h3 className="mt-2 text-lg font-bold text-gray-900">Azure + Nerdio</h3>
        </div>

        {/* Architecture Visualization */}
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex flex-col items-center"
          >
            <CloudIcon size={48} className="text-blue-500 mb-2" />
            <p className="text-xs text-gray-500">{infrastructure.sessionHostsNeeded} Session Hosts</p>
            <p className="text-xs text-gray-400">(Auto-scaled)</p>
          </motion.div>
        </div>

        <div className="divide-y divide-green-200">
          <CostItem
            icon={<CloudIcon size={24} className="text-blue-500" />}
            label="AVD Compute"
            description={`${infrastructure.concurrentUsers} concurrent users`}
            cost={costs.avdCompute}
            period="month"
            variant="future"
            delay={0.6}
          />
          {costs.nerdioLicense > 0 && (
            <CostItem
              icon={<NerdioIcon size={24} />}
              label="Nerdio Manager"
              description={`${infrastructure.mauUsers} MAU`}
              cost={costs.nerdioLicense}
              period="month"
              variant="future"
              delay={0.7}
            />
          )}
        </div>

        {/* Users */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
            <UsersIcon size={20} />
            <span className="text-sm">{userCount} Users</span>
          </div>
        </div>

        {/* Total */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-4 pt-4 border-t-2 border-green-300 bg-green-100 -mx-6 -mb-6 px-6 py-4 rounded-b-xl"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Cost</span>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(costs.totalAnnual)}/yr</p>
              <p className="text-sm text-green-500">{formatCurrency(costs.totalMonthly)}/mo</p>
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
