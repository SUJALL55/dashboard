import { useData } from '../utils/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Book, Database, TrendingUp, Target, FileText } from 'lucide-react';
import { exportMethodologyToPDF } from '../utils/pdfExport';

const Methodology = () => {
  const { analysis, dataStats, loading, loadingProgress, error } = useData();

  if (loading) return <LoadingSpinner message={loadingProgress} />;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!analysis) return <div className="p-8 text-center">No analysis available</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Methodology & Technical Documentation</h1>
              <p className="text-gray-600">Complete analytical framework for pressure performance intelligence</p>
            </div>
            <button
              onClick={exportMethodologyToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>

          {/* Executive Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Book className="w-6 h-6 mr-2 text-blue-600" />
              Executive Summary
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-800">
                This analysis identifies the most reliable cricket players under pressure situations in IPL and T20I matches 
                from 2022-2026. Using ball-by-ball data, we calculated pressure indices for each delivery and evaluated 
                player performance in high-stakes situations (pressure index ≥ 60) compared to normal conditions.
              </p>
            </div>
          </section>

          {/* Dataset */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-green-600" />
              Dataset Description
            </h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Total Matches Analyzed:</strong> {dataStats?.total_matches || 'N/A'}</p>
              <p><strong>Total Deliveries:</strong> {(dataStats?.total_balls || 0).toLocaleString()}</p>
              <p><strong>Coverage:</strong> IPL 2022-2026 + T20I Series 2022-2026</p>
              <p><strong>Players Analyzed:</strong> {analysis.summary.total_players_analyzed}</p>
            </div>
          </section>

          {/* Pressure Index */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-orange-600" />
              Pressure Index Formula
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Innings 2 (Chasing):</h3>
                <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                  Pressure = (RRR × 8) + (Wickets_Lost/10 × 25) + (Balls_Used/120 × 20) + (Runs_Needed/Balls × 10)
                </code>
                <p className="text-sm text-gray-600 mt-2">Max: 100 points</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Innings 1 (Setting Target):</h3>
                <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                  Pressure = (Wickets_Lost/10 × 30) + Phase_Pressure(25) + RR_Gap × 3 + Resource_Pressure(25)
                </code>
                <p className="text-sm text-gray-600 mt-2">Max: 100 points</p>
              </div>
            </div>
          </section>

          {/* Batting Reliability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2 text-purple-600" />
              Batting Reliability Index
            </h2>
            <div className="space-y-3">
              <div className="bg-purple-50 border-l-4 border-purple-600 p-3">
                <p className="font-semibold text-purple-900">Strike Rate Maintenance (40 points)</p>
                <p className="text-sm text-purple-700">Maintaining or improving SR under pressure vs normal</p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-3">
                <p className="font-semibold text-purple-900">Boundary Production (20 points)</p>
                <p className="text-sm text-purple-700">Percentage of boundaries under pressure</p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-3">
                <p className="font-semibold text-purple-900">Dismissal Avoidance (20 points)</p>
                <p className="text-sm text-purple-700">Lower dismissal rate is better</p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-3">
                <p className="font-semibold text-purple-900">Consistency (10 points)</p>
                <p className="text-sm text-purple-700">Number of pressure matches participated</p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-3">
                <p className="font-semibold text-purple-900">High Pressure Performance (10 points)</p>
                <p className="text-sm text-purple-700">Performance in extreme situations (80+)</p>
              </div>
            </div>
          </section>

          {/* Bowling Reliability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bowling Reliability Index</h2>
            <div className="space-y-3">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-3">
                <p className="font-semibold text-blue-900">Economy Control (40 points)</p>
                <p className="text-sm text-blue-700">Maintaining low economy under pressure</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-3">
                <p className="font-semibold text-blue-900">Wicket-Taking (25 points)</p>
                <p className="text-sm text-blue-700">Number of pressure wickets taken</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-3">
                <p className="font-semibold text-blue-900">Dot Ball Production (15 points)</p>
                <p className="text-sm text-blue-700">Percentage of dot balls bowled</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-3">
                <p className="font-semibold text-blue-900">Boundary Prevention (10 points)</p>
                <p className="text-sm text-blue-700">Lower boundary concession rate</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-3">
                <p className="font-semibold text-blue-900">Consistency (10 points)</p>
                <p className="text-sm text-blue-700">Number of pressure matches participated</p>
              </div>
            </div>
          </section>

          {/* Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Player Eligibility Criteria</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
              <p className="text-gray-800"><strong>Batters:</strong> Minimum 30 pressure balls faced + 5 pressure matches</p>
              <p className="text-gray-800"><strong>Bowlers:</strong> Minimum 24 pressure balls bowled (4 overs) + 5 pressure matches</p>
              <p className="text-sm text-gray-600 mt-2">
                Sample size adjustment applied using statistical shrinkage to prevent small-sample bias.
              </p>
            </div>
          </section>

          {/* Key Findings */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Findings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-900">Eligible Batters</p>
                <p className="text-3xl font-bold text-green-700">{analysis.summary.eligible_batters}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900">Eligible Bowlers</p>
                <p className="text-3xl font-bold text-blue-700">{analysis.summary.eligible_bowlers}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="font-semibold text-orange-900">Pressure Deliveries</p>
                <p className="text-3xl font-bold text-orange-700">{analysis.summary.total_pressure_balls.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-semibold text-purple-900">High Pressure</p>
                <p className="text-3xl font-bold text-purple-700">{analysis.summary.total_high_pressure_balls.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Limitations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Run-outs excluded from bowler wicket counts (not bowler's direct action)</li>
              <li>Player form and fitness not considered</li>
              <li>Venue and pitch conditions not factored</li>
              <li>Opposition quality not normalized</li>
              <li>Small sample sizes for some players despite minimum thresholds</li>
            </ul>
          </section>

          {/* Conclusion */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Conclusion</h2>
            <p className="text-gray-700">
              This analysis provides data-driven insights into player reliability under pressure. The rankings are based 
              entirely on actual performance data with transparent, reproducible calculations. Players at the top 
              demonstrate consistent ability to maintain or improve their performance when matches are on the line.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Methodology;
