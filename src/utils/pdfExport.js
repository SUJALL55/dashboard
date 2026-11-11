import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Export Methodology to PDF
export const exportMethodologyToPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('IPL Pressure Performance Intelligence System', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(14);
  doc.text('Methodology & Technical Documentation', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Introduction
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Overview', 14, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const introText = 'This system analyzes ball-by-ball data from IPL and T20I matches (2022-2026) to identify the most reliable players under high-pressure situations. Pressure is calculated using a proprietary index (0-100) based on match context.';
  const splitIntro = doc.splitTextToSize(introText, pageWidth - 28);
  doc.text(splitIntro, 14, yPos);
  yPos += splitIntro.length * 5 + 10;

  // Pressure Index Formula
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Pressure Index Calculation', 14, yPos);
  yPos += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Innings 2 (Chasing):', 14, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const innings2Formula = [
    'RRR × 8 (Required run rate pressure)',
    'Wickets Lost / 10 × 25 (Resource depletion)',
    'Balls Used / 120 × 20 (Time pressure)',
    'Runs Needed / Balls Left × 10 (Match closeness)'
  ];
  innings2Formula.forEach(line => {
    doc.text('• ' + line, 18, yPos);
    yPos += 5;
  });
  yPos += 5;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Innings 1 (Batting First):', 14, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const innings1Formula = [
    'Wickets Lost / 10 × 30 (Resource pressure)',
    'Phase Pressure × 25 (Death overs = high pressure)',
    'Run Rate Gap × 3 (vs. expected run rate)',
    'Resource State × 25 (Combined wickets + overs)'
  ];
  innings1Formula.forEach(line => {
    doc.text('• ' + line, 18, yPos);
    yPos += 5;
  });
  yPos += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Threshold: Pressure Index ≥ 60 is classified as "Under Pressure"', 14, yPos);
  yPos += 10;

  // New page for batting reliability
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Batting Reliability Score (0-100)', 14, yPos);
  yPos += 10;

  const battingComponents = [
    ['Component', 'Weight', 'Description'],
    ['SR Maintenance', '40 pts', 'Pressure SR vs Normal SR'],
    ['Boundaries', '20 pts', 'Boundary percentage under pressure'],
    ['Dismissal Avoidance', '20 pts', 'Survival rate in pressure'],
    ['Consistency', '10 pts', 'Performance across matches'],
    ['High-Pressure', '10 pts', 'Performance at extreme pressure (80+)']
  ];

  autoTable(doc, {
    startY: yPos,
    head: [battingComponents[0]],
    body: battingComponents.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 14, right: 14 }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Eligibility Criteria:', 14, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('• Minimum 30 pressure balls faced', 18, yPos);
  yPos += 5;
  doc.text('• Minimum 5 matches with pressure situations', 18, yPos);
  yPos += 15;

  // Bowling Reliability
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Bowling Reliability Score (0-100)', 14, yPos);
  yPos += 10;

  const bowlingComponents = [
    ['Component', 'Weight', 'Description'],
    ['Economy Control', '40 pts', 'Economy rate under pressure'],
    ['Wicket-Taking', '25 pts', 'Wickets in pressure situations'],
    ['Dot Ball %', '15 pts', 'Percentage of dot balls'],
    ['Boundary Prevention', '10 pts', 'Limiting boundaries under pressure'],
    ['Consistency', '10 pts', 'Performance across matches']
  ];

  autoTable(doc, {
    startY: yPos,
    head: [bowlingComponents[0]],
    body: bowlingComponents.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    margin: { left: 14, right: 14 }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Eligibility Criteria:', 14, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('• Minimum 24 pressure balls bowled (4 overs)', 18, yPos);
  yPos += 5;
  doc.text('• Minimum 5 matches with pressure situations', 18, yPos);
  yPos += 5;
  doc.text('• Run-outs excluded from wicket calculations', 18, yPos);
  yPos += 15;

  // Data Sources
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Data Sources & Coverage', 14, yPos);
  yPos += 10;

  const dataSources = [
    ['Competition', 'Years', 'Matches'],
    ['IPL', '2022-2026', '5 seasons'],
    ['T20 Internationals', '2022-2026', '134 bilateral series']
  ];

  autoTable(doc, {
    startY: yPos,
    head: [dataSources[0]],
    body: dataSources.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Limitations
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Limitations & Considerations', 14, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const limitations = [
    'Sample size varies by player (confidence levels indicate reliability)',
    'Does not account for match importance or opposition strength',
    'Pressure calculation is statistical, not psychological',
    'Player roles and batting positions may affect comparability'
  ];
  limitations.forEach(line => {
    const split = doc.splitTextToSize('• ' + line, pageWidth - 32);
    doc.text(split, 18, yPos);
    yPos += split.length * 5 + 2;
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `IPL Pressure Performance Intelligence System - Methodology - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`methodology_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Pressure Overview to PDF
export const exportPressureOverviewToPDF = (enrichedData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Pressure Distribution Analysis', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Calculate statistics
  const pressureDistribution = {
    normal: enrichedData.filter(b => b.pressure_category === 'Normal').length,
    moderate: enrichedData.filter(b => b.pressure_category === 'Moderate').length,
    high: enrichedData.filter(b => b.pressure_category === 'High').length,
    extreme: enrichedData.filter(b => b.pressure_category === 'Extreme').length,
  };

  const total = enrichedData.length;

  // Distribution Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Pressure Category Distribution', 14, yPos);
  yPos += 7;

  const distributionData = [
    ['Category', 'Range', 'Deliveries', 'Percentage'],
    ['Normal', '0-39', pressureDistribution.normal.toLocaleString(), ((pressureDistribution.normal / total) * 100).toFixed(1) + '%'],
    ['Moderate', '40-59', pressureDistribution.moderate.toLocaleString(), ((pressureDistribution.moderate / total) * 100).toFixed(1) + '%'],
    ['High', '60-79', pressureDistribution.high.toLocaleString(), ((pressureDistribution.high / total) * 100).toFixed(1) + '%'],
    ['Extreme', '80-100', pressureDistribution.extreme.toLocaleString(), ((pressureDistribution.extreme / total) * 100).toFixed(1) + '%']
  ];

  autoTable(doc, {
    startY: yPos,
    head: [distributionData[0]],
    body: distributionData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Key Insights
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Insights', 14, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const insights = [
    `Total deliveries analyzed: ${total.toLocaleString()}`,
    `Pressure situations (≥60): ${((pressureDistribution.high + pressureDistribution.extreme) / total * 100).toFixed(1)}%`,
    `Extreme pressure (≥80): ${(pressureDistribution.extreme / total * 100).toFixed(1)}%`,
    `Most common category: ${Object.entries(pressureDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0].charAt(0).toUpperCase() + Object.entries(pressureDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0].slice(1)}`
  ];

  insights.forEach(line => {
    doc.text('• ' + line, 18, yPos);
    yPos += 6;
  });

  // Footer
  doc.setFontSize(8);
  doc.text(
    'IPL Pressure Performance Intelligence System - Pressure Overview',
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );

  doc.save(`pressure_overview_${new Date().toISOString().split('T')[0]}.pdf`);
};
