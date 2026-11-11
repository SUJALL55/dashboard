import { useState } from 'react';
import { useData } from '../utils/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trophy, TrendingUp, Target, Award, Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { downloadCSV, exportRankingsToCSV } from '../services/rankingEngine';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TopBatters = () => {
  const { analysis, loading, loadingProgress, error } = useData();
  const [sortBy, setSortBy] = useState('rank');

  if (loading) return <LoadingSpinner message={loadingProgress} />;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!analysis) return <div className="p-8 text-center">No analysis available</div>;

  const { topBatters } = analysis;

  // Sort batters
  const sortedBatters = [...topBatters].sort((a, b) => {
    if (sortBy === 'rank') return a.rank - b.rank;
    if (sortBy === 'reliability') return b.reliability_score - a.reliability_score;
    if (sortBy === 'pressure_sr') return b.pressure_strike_rate - a.pressure_strike_rate;
    if (sortBy === 'sr_diff') return b.strike_rate_diff - a.strike_rate_diff;
    return 0;
  });

  // Chart data
  const chartData = sortedBatters.slice(0, 10).map(b => ({
    name: b.player_name.split(' ').slice(-1)[0],
    'Pressure SR': b.pressure_strike_rate,
    'Normal SR': b.normal_strike_rate,
    'Reliability': b.reliability_score,
  }));

  const handleExport = () => {
    const { batterCSV } = exportRankingsToCSV(topBatters, []);
    downloadCSV(batterCSV, 'top10_batters_under_pressure.csv');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for better table fit
    const pageWidth = doc.internal.pageSize.width;
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 10 Most Reliable Batters Under Pressure', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`IPL & T20I Pressure Performance Analysis (2022-2026)`, pageWidth / 2, 22, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
    
    // Summary Stats
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 14, 38);
    
    const summaryData = [
      ['Total Eligible Batters', analysis.summary.eligible_batters],
      ['Average Pressure SR', (topBatters.reduce((sum, b) => sum + b.pressure_strike_rate, 0) / topBatters.length).toFixed(1)],
      ['Highest Reliability Score', topBatters[0].reliability_score.toFixed(1)],
      ['Minimum Pressure Balls', '30']
    ];
    
    autoTable(doc, {
      startY: 42,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] },
      margin: { left: 14, right: pageWidth / 2 + 10 },
      tableWidth: (pageWidth / 2) - 20
    });
    
    // Rankings Table
    const tableData = sortedBatters.map(b => [
      b.rank,
      b.player_name,
      b.pressure_matches,
      b.pressure_balls,
      b.pressure_strike_rate.toFixed(1),
      b.normal_strike_rate.toFixed(1),
      (b.strike_rate_diff >= 0 ? '+' : '') + b.strike_rate_diff.toFixed(1),
      b.pressure_average.toFixed(1),
      b.reliability_score.toFixed(1),
      b.confidence_level
    ]);
    
    autoTable(doc, {
      startY: 75,
      head: [['Rank', 'Player', 'Matches', 'P.Balls', 'P.SR', 'N.SR', 'Diff', 'P.Avg', 'Score', 'Conf.']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `IPL Pressure Performance Intelligence System - Top Batters Report - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`top10_batters_pressure_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Top 10 Most Reliable Batters Under Pressure</h1>
              <p className="text-gray-600 mt-1">Rankings based on pressure performance analysis (Pressure Index ≥ 60)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Eligible</p>
                <p className="text-2xl font-bold text-purple-600">{analysis.summary.eligible_batters}</p>
              </div>
              <Award className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Pressure SR</p>
                <p className="text-2xl font-bold text-green-600">
                  {(topBatters.reduce((sum, b) => sum + b.pressure_strike_rate, 0) / topBatters.length).toFixed(1)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Highest Score</p>
                <p className="text-2xl font-bold text-orange-600">{topBatters[0].reliability_score.toFixed(1)}</p>
              </div>
              <Trophy className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Minimum Balls</p>
                <p className="text-2xl font-bold text-blue-600">30</p>
              </div>
              <Target className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Strike Rate Comparison: Pressure vs Normal</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Pressure SR" fill="#8B5CF6" name="Pressure Strike Rate" />
              <Bar dataKey="Normal SR" fill="#3B82F6" name="Normal Strike Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sort Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="rank">Rank (Default)</option>
              <option value="reliability">Reliability Score</option>
              <option value="pressure_sr">Pressure Strike Rate</option>
              <option value="sr_diff">SR Improvement</option>
            </select>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Complete Rankings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Teams</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P.Balls</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P.Runs</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P.SR</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">N.SR</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SR Diff</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P.Avg</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Dot%</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reliability</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBatters.map((batter) => (
                  <tr key={batter.player_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                        batter.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                        batter.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                        batter.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {batter.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {batter.player_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{batter.player_name}</div>
                          <div className="text-xs text-gray-500">
                            {batter.competitions.has_ipl && <span className="text-blue-600 font-semibold">IPL</span>}
                            {batter.competitions.has_ipl && batter.competitions.has_t20i && ' • '}
                            {batter.competitions.has_t20i && <span className="text-green-600 font-semibold">T20I</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600 max-w-xs truncate">{batter.teams}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {batter.pressure_matches}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-blue-600">
                      {batter.pressure_balls}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-purple-600">
                      {batter.pressure_runs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-green-600">
                      {batter.pressure_strike_rate.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {batter.normal_strike_rate.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-semibold ${
                        batter.strike_rate_diff >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {batter.strike_rate_diff >= 0 ? '+' : ''}{batter.strike_rate_diff.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {batter.pressure_average.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {batter.pressure_dot_pct.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-lg font-bold text-purple-600">{batter.reliability_score.toFixed(1)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        batter.confidence_level === 'High' ? 'bg-green-100 text-green-800' :
                        batter.confidence_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {batter.confidence_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-blue-900 mb-2">Column Definitions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800">
            <div><strong>P.Balls:</strong> Pressure balls faced</div>
            <div><strong>P.Runs:</strong> Runs under pressure</div>
            <div><strong>P.SR:</strong> Pressure strike rate</div>
            <div><strong>N.SR:</strong> Normal strike rate</div>
            <div><strong>SR Diff:</strong> P.SR minus N.SR</div>
            <div><strong>P.Avg:</strong> Pressure batting average</div>
            <div><strong>Dot%:</strong> Dot ball percentage</div>
            <div><strong>Reliability:</strong> Overall reliability score (0-100)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBatters;
