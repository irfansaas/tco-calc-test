'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ArchitectureDiagram from '@/components/architecture/ArchitectureDiagram';
import SavingsBanner from './SavingsBanner';
import CostOfDelayPanel from '@/components/cost-of-delay/CostOfDelayPanel';
import { ArrowDownIcon, ArrowRightIcon } from '@/components/icons';
import { CalculatorOutput, formatCurrency } from '@/lib/calculations';
import { exportToPDF, PDFExportData } from '@/lib/pdfExport';
import { saveScenario } from '@/lib/scenarioStorage';
import { CustomPricing } from './PricingPanel';
import { useToast } from '@/components/ui/Toast';

interface EnhancedResultsPanelProps {
  result: CalculatorOutput;
  userCount: number;
  clientName: string;
  pricing: CustomPricing;
  concurrencyRate: number;
  mauRate: number;
  includeWindowsServer: boolean;
  includeNerdio: boolean;
  onScenarioSaved?: () => void;
  onLineItemChange?: (key: string, value: number) => void;
}

export default function EnhancedResultsPanel({
  result,
  userCount,
  clientName,
  pricing,
  concurrencyRate,
  mauRate,
  includeWindowsServer,
  includeNerdio,
  onScenarioSaved,
  onLineItemChange,
}: EnhancedResultsPanelProps) {
  const [showCostOfDelay, setShowCostOfDelay] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pricingData = {
        citrixPerConcurrent: pricing.citrixPerConcurrent,
        rdsCalPerUser: pricing.rdsCalPerUser,
        windowsSvrPerCore: pricing.windowsSvrPerCore,
        avdComputePerUser: pricing.avdComputePerUser,
        nerdioLicense: pricing.nerdioLicense,
      };

      const data: PDFExportData = {
        clientName,
        userCount,
        result,
        generatedAt: new Date(),
        pricing: pricingData,
      };

      // Save scenario to localStorage
      const saveResult = saveScenario({
        clientName: clientName || 'Unnamed Client',
        inputs: {
          userCount,
          concurrencyRate,
          mauRate,
          nerdioLicense: pricing.nerdioLicense,
          includeWindowsServer,
          includeNerdio,
          pricing: pricingData,
        },
        result,
      });

      if (saveResult.success) {
        showToast('Scenario saved successfully!', 'success');
        // Notify parent that scenario was saved
        onScenarioSaved?.();
      } else {
        showToast(saveResult.error || 'Failed to save scenario', 'error');
      }

      // Export PDF
      await exportToPDF('results-container', data);
      showToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF export failed:', error);
      showToast('Failed to export PDF. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareResults = async () => {
    try {
      const migrationText = result.deploymentMode === 'hybrid'
        ? 'with AVD Hybrid (eliminating Citrix licensing)'
        : 'by migrating from Citrix to Azure AVD';
      const shareText = `TCO Analysis for ${clientName || 'Client'}: Save ${formatCurrency(result.savings.annualAmount)} per year ${migrationText}!`;

      if (navigator.share) {
        await navigator.share({
          title: 'Citrix to AVD TCO Analysis',
          text: shareText,
          url: window.location.href,
        });
        showToast('Shared successfully!', 'success');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        showToast('Results copied to clipboard!', 'success');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        showToast('Failed to share results', 'error');
      }
    }
  };

  const handleTalkToSpecialist = () => {
    // Open Calendly or contact form in new tab
    window.open('https://nerdio.com/contact/', '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center px-2"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">TCO Analysis Results</h2>
        {clientName && (
          <p className="text-base sm:text-lg text-blue-600 font-medium">{clientName}</p>
        )}
        <p className="text-sm sm:text-base text-gray-500">Based on {userCount.toLocaleString()} users</p>
      </motion.div>

      {/* Export Results Container */}
      <div id="results-container" ref={resultsRef} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6">
        {/* Client Header (for PDF) */}
        {clientName && (
          <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{clientName}</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {result.deploymentMode === 'hybrid'
                ? 'Citrix to AVD Hybrid - TCO Analysis'
                : 'Citrix to AVD Migration - TCO Analysis'}
            </p>
          </div>
        )}

        {/* Architecture Comparison - Desktop: side by side */}
        <div className="hidden md:grid grid-cols-2 gap-6 relative">
          <ArchitectureDiagram
            result={result}
            userCount={userCount}
            clientName={clientName}
            variant="current"
            pricing={pricing}
            onLineItemChange={onLineItemChange}
          />
          <ArchitectureDiagram
            result={result}
            userCount={userCount}
            clientName={clientName}
            variant="future"
            pricing={pricing}
            onLineItemChange={onLineItemChange}
          />
          {/* Transition Arrow - centered between columns */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-white rounded-full p-4 shadow-xl border-2 border-blue-200"
            >
              <ArrowRightIcon size={28} className="text-blue-500" />
            </motion.div>
          </div>
        </div>

        {/* Architecture Comparison - Mobile: stacked */}
        <div className="md:hidden space-y-3">
          <ArchitectureDiagram
            result={result}
            userCount={userCount}
            clientName={clientName}
            variant="current"
            pricing={pricing}
            onLineItemChange={onLineItemChange}
          />
          <div className="flex justify-center -my-1">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-white rounded-full p-3 shadow-lg border-2 border-blue-200"
            >
              <ArrowDownIcon size={24} className="text-blue-500" />
            </motion.div>
          </div>
          <ArchitectureDiagram
            result={result}
            userCount={userCount}
            clientName={clientName}
            variant="future"
            pricing={pricing}
            onLineItemChange={onLineItemChange}
          />
        </div>

        {/* Savings Banner */}
        <div className="mt-4 sm:mt-6">
          <SavingsBanner savings={result.savings} deploymentMode={result.deploymentMode} />
        </div>

        {/* Summary Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-4 sm:mt-6 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4"
        >
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-center">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Total Users</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{userCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Concurrent</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{result.infrastructure.concurrentUsers}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Session Hosts</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{result.infrastructure.sessionHostsNeeded}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Servers</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{result.infrastructure.physicalServersNeeded}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cost of Delay Panel */}
      <CostOfDelayPanel
        costOfDelay={result.costOfDelay}
        isVisible={showCostOfDelay}
        onToggle={() => setShowCostOfDelay(!showCostOfDelay)}
        isCloudCheaper={result.savings.isCloudCheaper}
      />

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
        className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
      >
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <span className="mr-2">📄</span>
              Download PDF
            </>
          )}
        </button>
        <button
          onClick={handleShareResults}
          className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">📤</span>
          Share Results
        </button>
        <button
          onClick={handleTalkToSpecialist}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">📞</span>
          Talk to a Specialist
        </button>
      </motion.div>

      {/* Pricing Assumptions Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500"
      >
        <p className="font-medium mb-2">Pricing Assumptions:</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <span>Citrix: ${pricing.citrixPerConcurrent}/user/yr</span>
          <span>RDS CAL: ${pricing.rdsCalPerUser}/user/yr</span>
          <span>Windows: ${pricing.windowsSvrPerCore}/core/yr</span>
          <span>AVD: ${pricing.avdComputePerUser}/user/mo</span>
          <span>Nerdio: ${pricing.nerdioLicense}/MAU/mo</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
