'use client';

import jsPDF from 'jspdf';
import { CalculatorOutput, formatCurrency, formatPercentage } from './calculations';

export interface PDFExportData {
  clientName: string;
  userCount: number;
  result: CalculatorOutput;
  generatedAt: Date;
  pricing: {
    citrixPerConcurrent: number;
    rdsCalPerUser: number;
    windowsSvrPerCore: number;
    avdComputePerUser: number;
    nerdioLicense: number;
  };
}

// Draw a compact server icon
function drawServer(pdf: jsPDF, x: number, y: number, number: number) {
  // Server body
  pdf.setFillColor(55, 65, 81);
  pdf.roundedRect(x, y, 12, 16, 1, 1, 'F');

  // LED lights
  pdf.setFillColor(34, 197, 94);
  pdf.circle(x + 3, y + 3, 1, 'F');
  pdf.setFillColor(59, 130, 246);
  pdf.circle(x + 6, y + 3, 1, 'F');

  // Drive bay
  pdf.setFillColor(31, 41, 55);
  pdf.rect(x + 2, y + 6, 8, 3, 'F');

  // Server number
  pdf.setFontSize(6);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`${number}`, x + 6, y + 14, { align: 'center' });
}

// Draw a compact cloud VM icon
function drawCloudVM(pdf: jsPDF, x: number, y: number, number: number) {
  // VM body
  pdf.setFillColor(14, 165, 233);
  pdf.roundedRect(x, y, 11, 14, 1, 1, 'F');

  // Monitor screen
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x + 2, y + 2, 7, 5, 'F');
  pdf.setFillColor(14, 165, 233);
  pdf.rect(x + 2.5, y + 2.5, 6, 4, 'F');

  // Stand
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x + 4, y + 7, 3, 1, 'F');
  pdf.rect(x + 3, y + 8, 5, 1, 'F');

  // VM number
  pdf.setFontSize(5);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`${number}`, x + 5.5, y + 12.5, { align: 'center' });

  // Status dot
  pdf.setFillColor(34, 197, 94);
  pdf.circle(x + 10, y + 2, 1, 'F');
}

// Draw a user avatar (simplified)
function drawUser(pdf: jsPDF, x: number, y: number, colorIndex: number) {
  const colors: [number, number, number][] = [
    [147, 51, 234],
    [236, 72, 153],
    [99, 102, 241],
    [20, 184, 166],
    [249, 115, 22],
  ];
  const color = colors[colorIndex % colors.length];

  pdf.setFillColor(color[0], color[1], color[2]);
  pdf.circle(x, y, 4, 'F');
  pdf.setFillColor(255, 255, 255);
  pdf.circle(x, y - 1, 1.5, 'F');
}

export async function exportToPDF(
  _elementId: string,
  data: PDFExportData
): Promise<void> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 0;

    const serverCount = data.result.infrastructure.physicalServersNeeded;
    const sessionHostCount = data.result.infrastructure.sessionHostsNeeded;
    const isHybrid = data.result.deploymentMode === 'hybrid';

    // ============================================
    // HEADER
    // ============================================
    pdf.setFillColor(isHybrid ? 126 : 37, isHybrid ? 34 : 99, isHybrid ? 206 : 235);
    pdf.rect(0, 0, pageWidth, 32, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(isHybrid ? 'Citrix to AVD Hybrid' : 'Citrix to AVD Migration', margin, 15);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Total Cost of Ownership Analysis', margin, 24);

    if (data.clientName) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(data.clientName, pageWidth - margin, 15, { align: 'right' });
    }
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      data.generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      pageWidth - margin, 23, { align: 'right' }
    );

    yPos = 40;

    // ============================================
    // EXECUTIVE SUMMARY
    // ============================================
    pdf.setTextColor(37, 99, 235);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPos);
    yPos += 7;

    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'F');

    const summaryMetrics = isHybrid
      ? [
          { label: 'Total Users', value: data.userCount.toLocaleString() },
          { label: 'Concurrent Users', value: data.result.infrastructure.concurrentUsers.toLocaleString() },
          { label: 'Physical Servers', value: serverCount.toString() },
          { label: 'Citrix Removed', value: 'Yes' },
        ]
      : [
          { label: 'Total Users', value: data.userCount.toLocaleString() },
          { label: 'Concurrent Users', value: data.result.infrastructure.concurrentUsers.toLocaleString() },
          { label: 'Physical Servers', value: serverCount.toString() },
          { label: 'Azure VMs', value: sessionHostCount.toString() },
        ];

    const metricWidth = contentWidth / 4;
    summaryMetrics.forEach((m, i) => {
      const mx = margin + (i * metricWidth) + metricWidth / 2;
      pdf.setFontSize(7);
      pdf.setTextColor(107, 114, 128);
      pdf.setFont('helvetica', 'normal');
      pdf.text(m.label, mx, yPos + 6, { align: 'center' });
      pdf.setFontSize(11);
      pdf.setTextColor(17, 24, 39);
      pdf.setFont('helvetica', 'bold');
      pdf.text(m.value, mx, yPos + 13, { align: 'center' });
    });

    yPos += 25;

    // ============================================
    // INFRASTRUCTURE COMPARISON
    // ============================================
    pdf.setTextColor(37, 99, 235);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Infrastructure Comparison', margin, yPos);
    yPos += 8;

    const halfWidth = (contentWidth - 8) / 2;

    // --- CURRENT STATE BOX ---
    pdf.setFillColor(254, 242, 242);
    pdf.roundedRect(margin, yPos, halfWidth, 55, 2, 2, 'F');

    // Header bar
    pdf.setFillColor(220, 38, 38);
    pdf.roundedRect(margin, yPos, halfWidth, 10, 2, 2, 'F');
    pdf.rect(margin, yPos + 5, halfWidth, 5, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CURRENT STATE', margin + halfWidth / 2, yPos + 7, { align: 'center' });

    // Servers label
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${serverCount} Physical Server${serverCount > 1 ? 's' : ''}`, margin + halfWidth / 2, yPos + 16, { align: 'center' });

    // Draw servers (max 5 visible)
    const displayServers = Math.min(5, serverCount);
    const serverSpacing = 14;
    const serversWidth = displayServers * serverSpacing;
    const serverStartX = margin + (halfWidth - serversWidth) / 2;

    for (let i = 0; i < displayServers; i++) {
      drawServer(pdf, serverStartX + (i * serverSpacing), yPos + 19, i + 1);
    }
    if (serverCount > 5) {
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`+${serverCount - 5}`, serverStartX + serversWidth + 2, yPos + 28);
    }

    // Platform label
    pdf.setFillColor(126, 34, 206);
    pdf.roundedRect(margin + halfWidth / 2 - 18, yPos + 38, 36, 7, 1, 1, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Citrix Virtual Apps', margin + halfWidth / 2, yPos + 43, { align: 'center' });

    // Users
    const displayUsers = Math.min(4, Math.ceil(data.userCount / 200));
    const usersSpacing = 10;
    const usersWidth = displayUsers * usersSpacing;
    const userStartX = margin + (halfWidth - usersWidth) / 2 + 5;

    for (let i = 0; i < displayUsers; i++) {
      drawUser(pdf, userStartX + (i * usersSpacing), yPos + 51, i);
    }

    // --- FUTURE STATE BOX ---
    const futureX = margin + halfWidth + 8;
    pdf.setFillColor(isHybrid ? 243 : 236, isHybrid ? 232 : 253, isHybrid ? 255 : 245);
    pdf.roundedRect(futureX, yPos, halfWidth, 55, 2, 2, 'F');

    // Header bar
    pdf.setFillColor(isHybrid ? 126 : 16, isHybrid ? 34 : 185, isHybrid ? 206 : 129);
    pdf.roundedRect(futureX, yPos, halfWidth, 10, 2, 2, 'F');
    pdf.rect(futureX, yPos + 5, halfWidth, 5, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FUTURE STATE', futureX + halfWidth / 2, yPos + 7, { align: 'center' });

    if (isHybrid) {
      // Hybrid mode: Show on-prem servers (same infrastructure, different platform)
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${serverCount} On-Prem Server${serverCount > 1 ? 's' : ''} (No Citrix)`, futureX + halfWidth / 2, yPos + 16, { align: 'center' });

      // Draw servers for hybrid (same as current, just different platform)
      const displayServersHybrid = Math.min(5, serverCount);
      const serverSpacingHybrid = 14;
      const serversWidthHybrid = displayServersHybrid * serverSpacingHybrid;
      const serverStartXHybrid = futureX + (halfWidth - serversWidthHybrid) / 2;

      for (let i = 0; i < displayServersHybrid; i++) {
        drawServer(pdf, serverStartXHybrid + (i * serverSpacingHybrid), yPos + 19, i + 1);
      }
      if (serverCount > 5) {
        pdf.setFontSize(8);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`+${serverCount - 5}`, serverStartXHybrid + serversWidthHybrid + 2, yPos + 28);
      }

      // Platform labels for hybrid
      pdf.setFillColor(99, 102, 241);
      pdf.roundedRect(futureX + halfWidth / 2 - 28, yPos + 38, 24, 7, 1, 1, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(6);
      pdf.text('AVD Hybrid', futureX + halfWidth / 2 - 16, yPos + 43, { align: 'center' });

      pdf.setFillColor(6, 182, 212);
      pdf.roundedRect(futureX + halfWidth / 2 + 4, yPos + 38, 24, 7, 1, 1, 'F');
      pdf.text('Nerdio', futureX + halfWidth / 2 + 16, yPos + 43, { align: 'center' });
    } else {
      // Cloud mode: Show Azure VMs
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${sessionHostCount} Azure Session Host${sessionHostCount > 1 ? 's' : ''}`, futureX + halfWidth / 2, yPos + 16, { align: 'center' });

      // Draw VMs (max 6 visible)
      const displayVMs = Math.min(6, sessionHostCount);
      const vmSpacing = 13;
      const vmsWidth = displayVMs * vmSpacing;
      const vmStartX = futureX + (halfWidth - vmsWidth) / 2;

      for (let i = 0; i < displayVMs; i++) {
        drawCloudVM(pdf, vmStartX + (i * vmSpacing), yPos + 19, i + 1);
      }
      if (sessionHostCount > 6) {
        pdf.setFontSize(8);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`+${sessionHostCount - 6}`, vmStartX + vmsWidth + 2, yPos + 28);
      }

      // Platform labels for cloud
      pdf.setFillColor(59, 130, 246);
      pdf.roundedRect(futureX + halfWidth / 2 - 28, yPos + 38, 24, 7, 1, 1, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(6);
      pdf.text('Azure AVD', futureX + halfWidth / 2 - 16, yPos + 43, { align: 'center' });

      pdf.setFillColor(6, 182, 212);
      pdf.roundedRect(futureX + halfWidth / 2 + 4, yPos + 38, 24, 7, 1, 1, 'F');
      pdf.text('Nerdio', futureX + halfWidth / 2 + 16, yPos + 43, { align: 'center' });
    }

    // Users
    for (let i = 0; i < displayUsers; i++) {
      drawUser(pdf, futureX + (halfWidth - usersWidth) / 2 + 5 + (i * usersSpacing), yPos + 51, i);
    }

    yPos += 62;

    // ============================================
    // COST COMPARISON TABLE
    // ============================================
    pdf.setTextColor(37, 99, 235);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Annual Cost Comparison', margin, yPos);
    yPos += 7;

    // Table header
    pdf.setFillColor(229, 231, 235);
    pdf.rect(margin, yPos, contentWidth, 8, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(55, 65, 81);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Cost Component', margin + 5, yPos + 5.5);
    pdf.text('Current (Citrix)', margin + contentWidth * 0.55, yPos + 5.5, { align: 'center' });
    pdf.text(isHybrid ? 'Future (AVD Hybrid)' : 'Future (AVD)', margin + contentWidth * 0.85, yPos + 5.5, { align: 'center' });
    yPos += 9;

    // Cost rows data - different for hybrid vs cloud
    const costs = isHybrid && data.result.hybrid
      ? [
          { name: 'Citrix License', current: data.result.onPrem.citrixLicense, future: 0 },
          { name: 'RDS CALs', current: data.result.onPrem.rdsCalLicense, future: data.result.hybrid.remainingCosts.rdsCalLicense },
          { name: 'Windows Server', current: data.result.onPrem.windowsServerLicense, future: data.result.hybrid.remainingCosts.windowsServerLicense },
          { name: 'Hypervisor', current: data.result.onPrem.hypervisorCost, future: data.result.hybrid.remainingCosts.hypervisorCost },
          { name: 'Nerdio License (Annual)', current: 0, future: data.result.hybrid.remainingCosts.nerdioLicense },
        ]
      : [
          { name: 'Citrix License', current: data.result.onPrem.citrixLicense, future: 0 },
          { name: 'RDS CALs', current: data.result.onPrem.rdsCalLicense, future: 0 },
          { name: 'Windows Server', current: data.result.onPrem.windowsServerLicense, future: 0 },
          { name: 'AVD Compute (Annual)', current: 0, future: data.result.cloud.avdCompute * 12 },
          { name: 'Nerdio License (Annual)', current: 0, future: data.result.cloud.nerdioLicense * 12 },
        ];

    costs.forEach((cost, i) => {
      if (i % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, yPos, contentWidth, 7, 'F');
      }

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(55, 65, 81);
      pdf.text(cost.name, margin + 5, yPos + 5);

      if (cost.current > 0) {
        pdf.setTextColor(185, 28, 28);
        pdf.text(formatCurrency(cost.current), margin + contentWidth * 0.55, yPos + 5, { align: 'center' });
      } else {
        pdf.setTextColor(156, 163, 175);
        pdf.text('-', margin + contentWidth * 0.55, yPos + 5, { align: 'center' });
      }

      if (cost.future > 0) {
        pdf.setTextColor(4, 120, 87);
        pdf.text(formatCurrency(cost.future), margin + contentWidth * 0.85, yPos + 5, { align: 'center' });
      } else {
        pdf.setTextColor(156, 163, 175);
        pdf.text('-', margin + contentWidth * 0.85, yPos + 5, { align: 'center' });
      }

      yPos += 7;
    });

    // Total row
    pdf.setFillColor(209, 213, 219);
    pdf.rect(margin, yPos, contentWidth, 9, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text('ANNUAL TOTAL', margin + 5, yPos + 6);
    pdf.setTextColor(185, 28, 28);
    pdf.text(formatCurrency(data.result.onPrem.totalAnnual), margin + contentWidth * 0.55, yPos + 6, { align: 'center' });
    pdf.setTextColor(isHybrid ? 126 : 4, isHybrid ? 34 : 120, isHybrid ? 206 : 87);
    const futureTotal = isHybrid && data.result.hybrid
      ? data.result.hybrid.remainingCosts.totalAnnual
      : data.result.cloud.totalAnnual;
    pdf.text(formatCurrency(futureTotal), margin + contentWidth * 0.85, yPos + 6, { align: 'center' });
    yPos += 15;

    // ============================================
    // SAVINGS BANNER
    // ============================================
    pdf.setFillColor(isHybrid ? 126 : 37, isHybrid ? 34 : 99, isHybrid ? 206 : 235);
    pdf.roundedRect(margin, yPos, contentWidth, 22, 3, 3, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(isHybrid ? 'Citrix License Savings' : 'Annual Savings', margin + 10, yPos + 10);

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(
      `${formatCurrency(data.result.savings.annualAmount)}`,
      pageWidth - margin - 50, yPos + 14, { align: 'right' }
    );

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(pageWidth - margin - 45, yPos + 6, 35, 12, 2, 2, 'F');
    pdf.setTextColor(isHybrid ? 126 : 37, isHybrid ? 34 : 99, isHybrid ? 206 : 235);
    pdf.setFontSize(12);
    pdf.text(formatPercentage(data.result.savings.percentage, 0), pageWidth - margin - 27.5, yPos + 14, { align: 'center' });

    yPos += 30;

    // ============================================
    // COST OF DELAY
    // ============================================
    pdf.setTextColor(37, 99, 235);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Cost of Delay', margin, yPos);
    yPos += 5;

    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Money lost by delaying migration:', margin, yPos);
    yPos += 6;

    const delays = [
      { label: 'Per Day', value: data.result.costOfDelay.perDay, bg: [254, 243, 199] as [number, number, number] },
      { label: 'Per Month', value: data.result.costOfDelay.perMonth, bg: [254, 215, 170] as [number, number, number] },
      { label: 'Per Quarter', value: data.result.costOfDelay.perMonth * 3, bg: [254, 178, 178] as [number, number, number] },
      { label: 'Per Year', value: data.result.costOfDelay.perYear, bg: [254, 202, 202] as [number, number, number] },
    ];

    const delayBoxW = (contentWidth - 12) / 4;
    delays.forEach((d, i) => {
      const bx = margin + i * (delayBoxW + 4);
      pdf.setFillColor(d.bg[0], d.bg[1], d.bg[2]);
      pdf.roundedRect(bx, yPos, delayBoxW, 16, 2, 2, 'F');

      pdf.setFontSize(7);
      pdf.setTextColor(107, 114, 128);
      pdf.setFont('helvetica', 'normal');
      pdf.text(d.label, bx + delayBoxW / 2, yPos + 5, { align: 'center' });

      pdf.setFontSize(9);
      pdf.setTextColor(127, 29, 29);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(d.value, 0), bx + delayBoxW / 2, yPos + 12, { align: 'center' });
    });

    yPos += 23;

    // ============================================
    // PRICING ASSUMPTIONS
    // ============================================
    pdf.setTextColor(37, 99, 235);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pricing Assumptions', margin, yPos);
    yPos += 6;

    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'F');

    const pricingInfo = [
      `Citrix: $${data.pricing.citrixPerConcurrent}/concurrent/yr`,
      `RDS CAL: $${data.pricing.rdsCalPerUser}/user/yr`,
      `Windows Server: $${data.pricing.windowsSvrPerCore}/core/yr`,
      `AVD Compute: $${data.pricing.avdComputePerUser}/user/mo`,
      `Nerdio: $${data.pricing.nerdioLicense}/MAU/mo`,
    ];

    pdf.setFontSize(7);
    pdf.setTextColor(75, 85, 99);
    pdf.setFont('helvetica', 'normal');

    pricingInfo.forEach((item, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      pdf.text(item, margin + 5 + (col * 60), yPos + 6 + (row * 8));
    });

    // ============================================
    // FOOTER
    // ============================================
    pdf.setTextColor(156, 163, 175);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      'This analysis is based on estimated costs. Actual costs may vary based on specific requirements.',
      pageWidth / 2, 284, { align: 'center' }
    );
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 114, 128);
    pdf.text('Created by Value Engineering', pageWidth / 2, 290, { align: 'center' });

    // Save
    const fileName = data.clientName
      ? `TCO_Analysis_${data.clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${data.generatedAt.toISOString().split('T')[0]}.pdf`
      : `TCO_Analysis_${data.generatedAt.toISOString().split('T')[0]}.pdf`;

    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
