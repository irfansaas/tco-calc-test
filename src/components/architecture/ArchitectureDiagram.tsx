'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, CalculatorOutput } from '@/lib/calculations';
import { usePersona } from '@/hooks/usePersona';
import {
  Server,
  Cloud,
  Users,
  Monitor,
  HardDrive,
  Network,
  Zap,
  Shield,
  Building2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Laptop,
  Layers,
  Tablet,
  Wifi,
  Lock,
  Database,
  Settings,
  AlertTriangle,
  CheckCircle2,
  User,
} from 'lucide-react';

interface ArchitectureDiagramProps {
  result: CalculatorOutput;
  userCount: number;
  clientName?: string;
  variant: 'current' | 'future';
  pricing?: {
    citrixPerConcurrent?: number;
    rdsCalPerUser?: number;
    windowsSvrPerCore?: number;
    avdComputePerUser?: number;
    nerdioLicense?: number;
  };
  onLineItemChange?: (key: string, value: number) => void;
}

// Collapsible Section
function CollapsibleSection({ title, icon, children, defaultExpanded = true, variant }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultExpanded?: boolean; variant: 'current' | 'future';
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const bgColor = variant === 'current' ? 'bg-red-50' : 'bg-green-50';
  const borderColor = variant === 'current' ? 'border-red-200' : 'border-green-200';
  const textColor = variant === 'current' ? 'text-red-700' : 'text-green-700';

  return (
    <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
      <button onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-3 py-2 ${bgColor} hover:opacity-90 transition-opacity`}>
        <div className="flex items-center gap-2">
          <span className={textColor}>{icon}</span>
          <span className={`text-xs sm:text-sm font-semibold ${textColor}`}>{title}</span>
        </div>
        {isExpanded ? <ChevronUp className={`w-4 h-4 ${textColor}`} /> : <ChevronDown className={`w-4 h-4 ${textColor}`} />}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="p-2 sm:p-3 bg-white">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Cost Items
function EditableCostItem({ label, cost, period, detail, variant, delay, isEditable = false, onEdit, itemKey }: {
  label: string; cost: number; period: 'year' | 'month'; detail?: string; variant: 'current' | 'future';
  delay: number; isEditable?: boolean; onEdit?: (key: string, value: number) => void; itemKey?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(cost.toString());
  const textColor = variant === 'current' ? 'text-red-600' : 'text-green-600';
  useEffect(() => { setEditValue(cost.toString()); }, [cost]);
  const handleSave = () => { if (onEdit && itemKey) onEdit(itemKey, parseFloat(editValue) || 0); setIsEditing(false); };

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      className="flex items-center justify-between py-1.5 sm:py-2 border-b border-gray-100 last:border-0 group">
      <div className="flex-1 min-w-0">
        <span className="text-xs sm:text-sm text-gray-700">{label}</span>
        {detail && <span className="text-[10px] sm:text-xs text-gray-400 ml-1 sm:ml-2 hidden sm:inline">({detail})</span>}
      </div>
      <div className="flex items-center gap-1">
        {isEditing ? (
          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
            className="w-20 sm:w-24 px-2 py-1 text-xs sm:text-sm text-gray-900 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
        ) : (
          <>
            {cost === 0 ? (
              <button
                onClick={() => { if (isEditable) { setEditValue('0'); setIsEditing(true); } }}
                className={`font-semibold text-sm sm:text-base flex-shrink-0 px-2 py-0.5 rounded ${
                  isEditable
                    ? 'text-blue-500 bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-200'
                    : 'text-gray-400 bg-gray-50 border border-gray-200'
                }`}
              >
                Add
              </button>
            ) : (
              <>
                <span className={`font-semibold text-sm sm:text-base ${textColor} flex-shrink-0`}>
                  {formatCurrency(cost)}<span className="text-[10px] sm:text-xs text-gray-400">/{period === 'year' ? 'yr' : 'mo'}</span>
                </span>
                {isEditable && (
                  <button onClick={() => { setEditValue(cost.toString()); setIsEditing(true); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                    <Pencil className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// User with Device - clean flat icon style (Flaticon inspired)
function UserWithDevice({ type, delay, color }: { type: 'laptop' | 'desktop' | 'tablet'; delay: number; color: string }) {
  const icons = { laptop: Laptop, desktop: Monitor, tablet: Tablet };
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      className="flex flex-col items-center gap-1"
    >
      {/* User avatar - flat circular style */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
      </div>
      {/* Device - colorful rounded icon */}
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${color} flex items-center justify-center shadow-md`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
    </motion.div>
  );
}

// Data flow dots
function DataFlowDots({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full left-1/2 -ml-0.75"
          style={{ backgroundColor: color }}
          initial={{ top: 0, opacity: 0 }}
          animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: 'linear' }} />
      ))}
    </div>
  );
}

// Physical Server
function PhysicalServer({ number, delay }: { number: number; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      className="relative flex flex-col items-center justify-center w-10 h-14 sm:w-12 sm:h-16 rounded bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 border border-slate-500 shadow-lg">
      <div className="absolute top-1 left-1 right-1 flex justify-between px-0.5">
        <motion.div className="w-1 h-1 rounded-full bg-green-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
        <motion.div className="w-1 h-1 rounded-full bg-amber-400" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} />
        <motion.div className="w-1 h-1 rounded-full bg-blue-400" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
      </div>
      <div className="flex flex-col gap-0.5 mt-2">
        <div className="w-6 sm:w-8 h-1 bg-slate-500 rounded-sm" />
        <div className="w-6 sm:w-8 h-1 bg-slate-500 rounded-sm" />
        <div className="w-6 sm:w-8 h-1 bg-slate-500 rounded-sm" />
      </div>
      <motion.div className="absolute bottom-1 right-1" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.2, repeat: Infinity }}>
        <HardDrive className="w-2 h-2 text-orange-400" />
      </motion.div>
      <span className="absolute -bottom-4 text-[8px] font-medium text-slate-500">#{number}</span>
    </motion.div>
  );
}

// Cloud VM
function CloudVM({ number, delay }: { number: number; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring' }} className="relative">
      <motion.div className="absolute inset-0 rounded-lg bg-sky-400"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay }} />
      <div className="relative flex flex-col items-center justify-center w-10 h-12 sm:w-11 sm:h-13 rounded-lg bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 border border-sky-300 shadow-lg shadow-blue-400/30">
        <Monitor className="w-4 h-4 text-white" />
        <span className="text-[8px] sm:text-[9px] font-bold text-white mt-0.5">VM{number}</span>
        <motion.div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white shadow"
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
      </div>
    </motion.div>
  );
}

// Platform Badge
function PlatformBadge({ name, icon, variant }: { name: string; icon: React.ReactNode; variant: 'citrix' | 'nerdio' | 'azure' }) {
  const styles = {
    citrix: 'from-purple-500 to-purple-700 border-purple-400 shadow-purple-400/30',
    nerdio: 'from-cyan-500 to-teal-600 border-cyan-400 shadow-cyan-400/30',
    azure: 'from-blue-500 to-blue-700 border-blue-400 shadow-blue-400/30',
  };
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r ${styles[variant]} border shadow-lg`}>
      <div className="text-white [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</div>
      <span className="text-white font-semibold text-[10px] sm:text-xs">{name}</span>
    </motion.div>
  );
}

// Connection Line with sequential animation
function ConnectionLine({ variant, label, baseDelay = 0 }: { variant: 'current' | 'future'; label?: string; baseDelay?: number }) {
  const color = variant === 'current' ? '#ef4444' : '#10b981';
  const bgColor = variant === 'current' ? 'bg-red-100' : 'bg-green-100';
  const textColor = variant === 'current' ? 'text-red-600' : 'text-green-600';

  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ delay: baseDelay, duration: 0.3, ease: 'easeOut' }}
      style={{ transformOrigin: 'top' }}
      className="relative flex flex-col items-center py-2"
    >
      <div className="relative h-10 w-0.5 bg-gradient-to-b from-gray-300 to-gray-400">
        <DataFlowDots color={color} />
      </div>
      {label && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: baseDelay + 0.2 }}
          className={`absolute top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-[9px] font-medium ${bgColor} ${textColor} shadow-sm`}>
          {label}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 2, 0] }}
        transition={{ delay: baseDelay + 0.15, duration: 1, repeat: Infinity }}
        className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent"
        style={{ borderTopColor: color }} />
    </motion.div>
  );
}

export default function ArchitectureDiagram({ result, userCount, clientName, variant, onLineItemChange }: ArchitectureDiagramProps) {
  const { config: personaConfig } = usePersona();
  const isCurrentState = variant === 'current';
  const serverCount = result.infrastructure.physicalServersNeeded;
  const sessionHostCount = result.infrastructure.sessionHostsNeeded;
  const canEdit = personaConfig.canEditLineItems;
  const concurrentUsers = result.infrastructure.concurrentUsers;

  // Persona-based visibility
  const showCostBreakdown = personaConfig.showCostBreakdown;
  const showInfrastructureCosts = personaConfig.showInfrastructureCosts;
  const showSoftwareLicensing = personaConfig.showSoftwareLicensing;

  // 5 users with devices
  // Colors matching the reference: blue → cyan → teal → purple → violet gradient
  const userDevices: Array<{ type: 'laptop' | 'desktop' | 'tablet'; color: string }> = [
    { type: 'laptop', color: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { type: 'desktop', color: 'bg-gradient-to-br from-cyan-400 to-cyan-600' },
    { type: 'desktop', color: 'bg-gradient-to-br from-teal-400 to-teal-600' },
    { type: 'tablet', color: 'bg-gradient-to-br from-violet-400 to-violet-600' },
    { type: 'laptop', color: 'bg-gradient-to-br from-purple-400 to-purple-600' },
  ];

  const displayServerCount = Math.min(4, serverCount);
  const displayHostCount = Math.min(5, sessionHostCount);
  const mauUsers = result.infrastructure.mauUsers;
  const perUserCost = isCurrentState
    ? result.onPrem.totalMonthly / concurrentUsers
    : result.cloud.totalMonthly / mauUsers;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className={`rounded-xl overflow-hidden shadow-lg ${
        isCurrentState
          ? 'bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30'
          : 'bg-gradient-to-br from-sky-50/50 via-blue-50/30 to-cyan-50/30'
      }`}>

      {/* Compact Header */}
      <div className={`px-3 sm:px-4 py-2 sm:py-3 ${
        isCurrentState
          ? 'bg-gradient-to-r from-red-500 via-red-600 to-orange-500'
          : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-lg">
              {isCurrentState ? <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">{isCurrentState ? 'Current State' : 'Future State'}</h3>
              <p className="text-[9px] sm:text-[10px] text-white/80">{isCurrentState ? 'On-Premise Citrix' : 'Azure Virtual Desktop + Nerdio'}</p>
            </div>
          </div>
          {clientName && (
            <span className="text-[9px] sm:text-[10px] text-white bg-white/20 px-2 py-0.5 rounded-full truncate max-w-[100px] hidden sm:inline">
              {clientName}
            </span>
          )}
        </div>
      </div>

      {/* Architecture - more horizontal space */}
      <div className="p-3 sm:p-4">

        {/* USERS WITH DEVICES - 5 clean icons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-2"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-2 mb-3"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="text-xs sm:text-sm font-bold text-gray-700">End Users</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: 'spring' }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium"
            >
              {userCount.toLocaleString()}
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex gap-5 sm:gap-8 justify-center py-2"
          >
            {userDevices.map((device, i) => (
              <UserWithDevice key={i} type={device.type} delay={0.3 + 0.08 * i} color={device.color} />
            ))}
          </motion.div>
        </motion.div>

        {/* Connection */}
        <ConnectionLine variant={variant} label={isCurrentState ? 'ICA Protocol' : 'RDP / HTTPS'} baseDelay={0.6} />

        {/* INFRASTRUCTURE */}
        {isCurrentState ? (
          /* ========== ON-PREM DATACENTER (no border, clean layout) ========== */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5, type: 'spring' }}
            className="relative"
          >
            {/* Warning badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="absolute -top-2 right-2 z-10"
            >
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 rounded-full border border-amber-200 shadow-sm">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span className="text-[9px] font-medium text-amber-700">Complex</span>
              </div>
            </motion.div>

            {/* Datacenter label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-center gap-2 mb-3"
            >
              <Building2 className="w-5 h-5 text-slate-600" />
              <span className="text-sm sm:text-base font-bold text-slate-700">On-Premise Datacenter</span>
            </motion.div>

            {/* Stacked layers - flow of complexity */}
            <div className="space-y-2">
              {/* Layer 1: Citrix Control Plane */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                className="p-3 bg-white/90 rounded-xl border border-purple-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Citrix Control Plane</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <PlatformBadge name="Citrix CVAD" icon={<Network />} variant="citrix" />
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded text-[9px] text-purple-700">
                      <Lock className="w-3 h-3" /> StoreFront
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded text-[9px] text-purple-700">
                      <Settings className="w-3 h-3" /> DDC
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Connector arrow */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1.1 }}
                  style={{ transformOrigin: 'top' }}
                  className="w-0.5 h-3 bg-gradient-to-b from-purple-300 to-orange-300"
                />
              </div>

              {/* Layer 2: Hypervisor */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.15, duration: 0.4 }}
                className="p-3 bg-white/90 rounded-xl border border-orange-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <Layers className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Hypervisor Layer</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 shadow-md">
                      <span className="text-white font-semibold text-[10px]">VMware vSphere</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded text-[9px] text-orange-700">
                      <Database className="w-3 h-3" /> vCenter
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Connector arrow */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1.25 }}
                  style={{ transformOrigin: 'top' }}
                  className="w-0.5 h-3 bg-gradient-to-b from-orange-300 to-slate-300"
                />
              </div>

              {/* Layer 3: Infrastructure + Physical Servers (merged) */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.4 }}
                className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <Server className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Infrastructure</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-300 text-slate-600">{serverCount} servers</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-[9px] text-slate-600">
                      <Wifi className="w-3 h-3" /> Network
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-[9px] text-slate-600">
                      <Zap className="w-3 h-3" /> Power
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-[9px] text-slate-600">
                      <Settings className="w-3 h-3" /> Cooling
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {[...Array(displayServerCount)].map((_, i) => (
                    <PhysicalServer key={i} number={i + 1} delay={1.4 + 0.1 * i} />
                  ))}
                  {serverCount > 4 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4 + 0.1 * displayServerCount }}
                      className="flex items-center justify-center w-10 h-14 sm:w-12 sm:h-16 rounded bg-slate-300 border-2 border-dashed border-slate-400"
                    >
                      <span className="text-[10px] font-bold text-slate-500">+{serverCount - 4}</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* ========== CLOUD WITH NERDIO OUTSIDE ========== */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5, type: 'spring' }}
            className="relative"
          >
            {/* Simple badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="absolute -top-2 right-2 z-20"
            >
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded-full border border-green-200 shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-[9px] font-medium text-green-700">Simple</span>
              </div>
            </motion.div>

            {/* NERDIO - Outside Azure, management layer on top */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="mb-3 p-3 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlatformBadge name="Nerdio Manager" icon={<Zap />} variant="nerdio" />
                  <span className="text-[9px] text-gray-500 hidden sm:inline">Independent SaaS Platform</span>
                </div>
                <div className="flex gap-1.5">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.05 }}
                    className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700"
                  >
                    Auto-scaling
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-[8px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700"
                  >
                    Cost Optimization
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Connection line from Nerdio to Azure */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.15 }}
              style={{ transformOrigin: 'top' }}
              className="flex justify-center mb-2"
            >
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-400 to-sky-400" />
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-600 font-medium">manages</span>
                <div className="w-0.5 h-4 bg-gradient-to-b from-sky-400 to-blue-400" />
              </div>
            </motion.div>

            {/* AZURE CLOUD - with cloud background */}
            <div className="relative">
              {/* Cloud background SVG */}
              <svg className="absolute inset-0 w-full h-full -z-0" viewBox="0 0 500 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cloudBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e0f2fe" />
                    <stop offset="50%" stopColor="#bae6fd" />
                    <stop offset="100%" stopColor="#7dd3fc" />
                  </linearGradient>
                  <filter id="cloudShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0ea5e9" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <motion.path
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  d="M40,35
                     Q25,20 55,12 Q85,0 125,10 Q165,-5 205,8 Q245,-8 285,5 Q325,-5 365,12 Q405,0 435,18 Q465,8 480,35
                     Q495,50 490,75 Q500,100 490,130 Q495,160 480,180 Q460,200 420,198
                     Q380,205 340,195 Q300,205 260,198 Q220,205 180,195 Q140,200 100,192 Q60,198 40,185
                     Q15,170 20,140 Q10,110 20,80 Q10,55 40,35 Z"
                  fill="url(#cloudBg)"
                  filter="url(#cloudShadow)"
                />
              </svg>

              {/* Floating cloud decorations */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ delay: 1.25, type: 'spring' }}
                className="absolute -top-3 left-6 z-10"
              >
                <Cloud className="w-10 h-10 text-sky-300" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ delay: 1.3, type: 'spring' }}
                className="absolute -top-1 right-10 z-10"
              >
                <Cloud className="w-8 h-8 text-blue-300" />
              </motion.div>

              {/* Azure content */}
              <div className="relative z-10 p-4 sm:p-5">
                {/* Azure label with AVD badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.25 }}
                  className="flex items-center justify-center gap-3 mb-4"
                >
                  <div className="p-1.5 bg-white/80 rounded-lg shadow-sm">
                    <Cloud className="w-5 h-5 text-sky-600" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-sky-800">Microsoft Azure</span>
                  <PlatformBadge name="AVD" icon={<Monitor />} variant="azure" />
                </motion.div>

                {/* Session Hosts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.35, duration: 0.4 }}
                  className="p-4"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Monitor className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">Session Hosts</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-200 text-sky-700">{sessionHostCount} VMs</span>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                    {[...Array(displayHostCount)].map((_, i) => (
                      <CloudVM key={i} number={i + 1} delay={1.45 + 0.08 * i} />
                    ))}
                    {sessionHostCount > 5 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.45 + 0.08 * displayHostCount }}
                        className="flex items-center justify-center w-10 h-12 rounded-lg bg-sky-100 border-2 border-dashed border-sky-300"
                      >
                        <span className="text-[9px] font-bold text-sky-500">+{sessionHostCount - 5}</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="flex flex-wrap justify-center gap-2 mt-3"
                >
                  {['Managed', 'Pay-as-you-go'].map((label, i) => (
                    <motion.span
                      key={label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.85 + i * 0.1 }}
                      className={`text-[9px] px-2 py-1 rounded-full font-medium shadow-sm ${
                        i === 0 ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {label}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Cost Breakdown - Only shown based on persona config */}
      {showCostBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.4 }}
          className="mx-3 sm:mx-4 mb-3 sm:mb-4 space-y-2"
        >
          {isCurrentState ? (
            <>
              {/* Infrastructure Costs - Only for SE/VE */}
              {showInfrastructureCosts && (
                <CollapsibleSection title="Infrastructure Costs" icon={<Server className="w-3 h-3" />} variant="current">
                  <EditableCostItem label="Server Hardware (Session Hosts)" cost={result.onPrem.serverHardwareSessionHosts || 0} period="year" variant="current" delay={1.95} isEditable={canEdit} onEdit={onLineItemChange} itemKey="serverHardwareSessionHosts" />
                  <EditableCostItem label="Server Hardware (Citrix Infra)" cost={result.onPrem.serverHardwareCitrixInfra || 0} period="year" variant="current" delay={2.0} isEditable={canEdit} onEdit={onLineItemChange} itemKey="serverHardwareCitrixInfra" />
                  <EditableCostItem label="Network Layer" cost={result.onPrem.networkLayer || 0} period="year" variant="current" delay={2.05} isEditable={canEdit} onEdit={onLineItemChange} itemKey="networkLayer" />
                  <EditableCostItem label="Power & Cooling" cost={result.onPrem.powerCooling || 0} period="year" variant="current" delay={2.1} isEditable={canEdit} onEdit={onLineItemChange} itemKey="powerCooling" />
                  <EditableCostItem label="Datacenter Floor Rent" cost={result.onPrem.datacenterRent || 0} period="year" variant="current" delay={2.15} isEditable={canEdit} onEdit={onLineItemChange} itemKey="datacenterRent" />
                  <EditableCostItem label="Operations & Maintenance" cost={result.onPrem.operationsMaintenance || 0} period="year" variant="current" delay={2.2} isEditable={canEdit} onEdit={onLineItemChange} itemKey="operationsMaintenance" />
                </CollapsibleSection>
              )}
              {/* Software Licensing - For AE/SE/VE */}
              {showSoftwareLicensing && (
                <CollapsibleSection title="Software Licensing" icon={<Shield className="w-3 h-3" />} variant="current">
                  <EditableCostItem label="Hypervisor (VMware/Broadcom)" cost={result.onPrem.hypervisorCost || 0} period="year" variant="current" delay={1.95} isEditable={canEdit} onEdit={onLineItemChange} itemKey="hypervisorCost" />
                  <EditableCostItem label="Citrix CVAD License" cost={result.onPrem.citrixLicense} period="year" detail={`${concurrentUsers} CCU`} variant="current" delay={2.0} isEditable={canEdit} onEdit={onLineItemChange} itemKey="citrixLicense" />
                  <EditableCostItem label="RDS CALs" cost={result.onPrem.rdsCalLicense} period="year" detail={`${userCount} users`} variant="current" delay={2.05} isEditable={canEdit} onEdit={onLineItemChange} itemKey="rdsCalLicense" />
                  <EditableCostItem label="Windows Server Datacenter" cost={result.onPrem.windowsServerLicense || 0} period="year" variant="current" delay={2.1} isEditable={canEdit} onEdit={onLineItemChange} itemKey="windowsServerLicense" />
                  <EditableCostItem label="SQL Server" cost={result.onPrem.sqlServerLicense || 0} period="year" variant="current" delay={2.15} isEditable={canEdit} onEdit={onLineItemChange} itemKey="sqlServerLicense" />
                </CollapsibleSection>
              )}
            </>
          ) : (
            <CollapsibleSection title="Azure Costs" icon={<Cloud className="w-3 h-3" />} variant="future">
              <EditableCostItem label="AVD Compute (VMs)" cost={result.cloud.avdCompute} period="month" detail="Business hours" variant="future" delay={1.95} isEditable={canEdit} onEdit={onLineItemChange} itemKey="avdCompute" />
              <EditableCostItem label="Nerdio Manager" cost={result.cloud.nerdioLicense || 0} period="month" detail={`${result.infrastructure.mauUsers} MAU`} variant="future" delay={2.0} isEditable={canEdit} onEdit={onLineItemChange} itemKey="nerdioLicense" />
              <EditableCostItem label="Admin & Operations" cost={result.cloud.adminOperations || 0} period="year" detail="Included" variant="future" delay={2.05} isEditable={canEdit} onEdit={onLineItemChange} itemKey="adminOperations" />
            </CollapsibleSection>
          )}
        </motion.div>
      )}

      {/* Total */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 2.3, duration: 0.5, type: 'spring' }}
        className={`mx-3 sm:mx-4 mb-3 sm:mb-4 p-3 rounded-lg shadow-md ${
          isCurrentState
            ? 'bg-gradient-to-r from-red-500 via-red-600 to-orange-500'
            : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500'
        }`}
      >
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.4 }}
          >
            <span className="text-white font-medium text-xs sm:text-sm">Annual Total</span>
            <div className="text-[10px] sm:text-xs text-white/70">${perUserCost.toFixed(2)}/{isCurrentState ? 'cc user' : 'mau user'}/mo</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.45 }}
            className="text-right"
          >
            <motion.p
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.5, type: 'spring', stiffness: 200 }}
              className="text-lg sm:text-xl font-bold text-white"
            >
              {formatCurrency(isCurrentState ? result.onPrem.totalAnnual : result.cloud.totalAnnual)}
              <span className="text-[10px] font-normal opacity-80">/yr</span>
            </motion.p>
            <p className="text-[10px] sm:text-xs text-white/80">{formatCurrency(isCurrentState ? result.onPrem.totalMonthly : result.cloud.totalMonthly)}/mo</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
