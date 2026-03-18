'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  Trash2,
  Calendar,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Cloud,
  CloudOff,
  Loader2,
} from 'lucide-react';
import { SavedScenario } from '@/lib/scenarioStorage';
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/Toast';
import { useScenarios } from '@/hooks/useScenarios';

interface SavedScenariosProps {
  onLoadScenario: (scenario: SavedScenario) => void;
  onRegeneratePDF: (scenario: SavedScenario) => void;
  refreshTrigger?: number;
}

export default function SavedScenarios({
  onLoadScenario,
  onRegeneratePDF,
  refreshTrigger,
}: SavedScenariosProps) {
  const {
    scenarios,
    isSyncing,
    cloudEnabled,
    deleteScenario: deleteScenarioHook,
    refreshScenarios,
  } = useScenarios();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);
  const { showToast } = useToast();

  // Refresh scenarios when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      refreshScenarios();
    }
  }, [refreshTrigger, refreshScenarios]);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScenarioToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (scenarioToDelete) {
      await deleteScenarioHook(scenarioToDelete);
      showToast('Scenario deleted', 'success');
    }
    setDeleteModalOpen(false);
    setScenarioToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setScenarioToDelete(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (scenarios.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
            <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Saved Scenarios</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-gray-500">{scenarios.length} saved</p>
              {/* Cloud sync status indicator */}
              {cloudEnabled && (
                <span className="flex items-center gap-1 text-xs">
                  {isSyncing ? (
                    <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                  ) : (
                    <Cloud className="w-3 h-3 text-green-500" />
                  )}
                </span>
              )}
              {!cloudEnabled && (
                <span className="flex items-center gap-1 text-xs text-gray-400" title="Local storage only">
                  <CloudOff className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        )}
      </button>

      {/* Scenarios List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="max-h-60 sm:max-h-80 overflow-y-auto divide-y divide-gray-100">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedId === scenario.id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() =>
                    setSelectedId(selectedId === scenario.id ? null : scenario.id)
                  }
                >
                  {/* Scenario Header */}
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {scenario.clientName || 'Unnamed Client'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 flex-shrink-0 ml-2">
                      <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 hidden sm:inline" />
                      {formatDate(scenario.createdAt).split(',')[0]}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {scenario.inputs.userCount.toLocaleString()}
                    </div>
                    <div className="text-green-600 font-medium">
                      {formatPercentage(scenario.result.savings.percentage, 0)}
                    </div>
                    <div className="text-green-600 hidden sm:block">
                      {formatCurrency(scenario.result.savings.annualAmount)}/yr
                    </div>
                  </div>

                  {/* Expanded Actions */}
                  <AnimatePresence>
                    {selectedId === scenario.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100"
                      >
                        <div className="flex gap-1.5 sm:gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLoadScenario(scenario);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm font-medium"
                          >
                            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Load</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRegeneratePDF(scenario);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">PDF</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(scenario.id, e)}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        {/* Detailed Info */}
                        <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                          <div className="bg-gray-50 rounded p-1.5 sm:p-2">
                            <span className="text-gray-500">Current:</span>
                            <span className="ml-1 font-medium text-red-600">
                              {formatCurrency(scenario.result.onPrem.totalAnnual)}
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded p-1.5 sm:p-2">
                            <span className="text-gray-500">Future:</span>
                            <span className="ml-1 font-medium text-green-600">
                              {formatCurrency(scenario.result.cloud.totalAnnual)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Scenario"
        message="Are you sure you want to delete this scenario? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
