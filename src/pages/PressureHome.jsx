import { useData } from '../utils/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { Trophy, Target, TrendingUp, Award, BarChart3, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PressureHome = () => {
  const { analysis, dataStats, loading, loadingProgress, error } = useData();

  if (loading) return <LoadingSpinner message={loadingProgress} />;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!analysis) return <div className="p-8 text-center">No analysis available</div>;

  const { topBatters, topBowlers, summary, enrichedData } = analysis;

  // Calculate pressure distribution
  const pressureDistribution = {
    normal: enrichedData.filter(b => b.pressure_category === 'Normal').length,
    moderate: enrichedData.filter(b => b.pressure_category === 'Moderate').length,
    high: enrichedData.filter(b => b.pressure_category === 'High').length,
    extreme: enrichedData.filter(b => b.pressure_category === 'Extreme').length,
  };

  const pieData = [
    { name: 'Normal (0-39)', value: pressureDistribution.normal, color: '#10B981' },
    { name: 'Moderate (40-59)', value: pressureDistribution.moderate, color: '#F59E0B' },
    { name: 'High (60-79)', value: pressureDistribution.high, color: '#EF4444' },
    { name: 'Extreme (80-100)', value: pressureDistribution.extreme, color: '#7C3AED' },
  ];

  const topBatter = topBatters[0];
  const topBowler = topBowlers[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              IPL Pressure Performance Intelligence System
            </h1>
            <p className="text-xl text-blue-100">
              Data-Driven Analysis of Most Reliable Players Under Pressure
            </p>
            <p className="text-sm text-blue-200 mt-2">
              Competition Round 1: IPL & T20I Analysis (2022-2026)
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
              <p className="text-blue-100 text-sm mb-1">Matches Analyzed</p>
              <p className="text-3xl font-bold">{dataStats?.total_matches || 0}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
              <p className="text-blue-100 text-sm mb-1">Pressure Deliveries</p>
              <p className="text-3xl font-bold">{summary.total_pressure_balls.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
              <p className="text-blue-100 text-sm mb-1">Players Analyzed</p>
              <p className="text-3xl font-bold">{summary.total_players_analyzed}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
              <p className="text-blue-100 text-sm mb-1">Eligible Players</p>
              <p className="text-3xl font-bold">{summary.eligible_batters + summary.eligible_bowlers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Top Performers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Batter */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm font-medium">Most Reliable Batter</p>
                <h2 className="text-3xl font-bold">{topBatter.player_name}</h2>
                <p className="text-purple-100 text-sm mt-1">{topBatter.teams}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <Trophy className="w-12 h-12" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-4xl font-bold">{topBatter.reliability_score.toFixed(1)}</p>
                <p className="text-purple-100 text-xs">Reliability Score</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{topBatter.pressure_strike_rate.toFixed(0)}</p>
                <p className="text-purple-100 text-xs">Pressure SR</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{topBatter.pressure_balls}</p>
                <p className="text-purple-100 text-xs">Pressure Balls</p>
              </div>
            </div>
            <Link 
              to="/top-batters" 
              className="inline-block bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              View Top 10 Batters →
            </Link>
          </div>

          {/* Top Bowler */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm font-medium">Most Reliable Bowler</p>
                <h2 className="text-3xl font-bold">{topBowler.player_name}</h2>
                <p className="text-blue-100 text-sm mt-1">{topBowler.teams}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <Target className="w-12 h-12" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-4xl font-bold">{topBowler.reliability_score.toFixed(1)}</p>
                <p className="text-blue-100 text-xs">Reliability Score</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{topBowler.pressure_economy.toFixed(1)}</p>
                <p className="text-blue-100 text-xs">Pressure Econ</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{topBowler.pressure_wickets}</p>
                <p className="text-blue-100 text-xs">Pressure Wkts</p>
              </div>
            </div>
            <Link 
              to="/top-bowlers" 
              className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              View Top 10 Bowlers →
            </Link>
          </div>
        </div>

        {/* Pressure Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pressure Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Analysis Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Eligible Batters</span>
                <span className="text-xl font-bold text-purple-600">{summary.eligible_batters}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Eligible Bowlers</span>
                <span className="text-xl font-bold text-blue-600">{summary.eligible_bowlers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">High Pressure Deliveries</span>
                <span className="text-xl font-bold text-red-600">{summary.total_high_pressure_balls.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Pressure Threshold</span>
                <span className="text-xl font-bold text-orange-600">60+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/pressure-overview" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-12 h-12 text-blue-600" />
              <div className="w-3 h-3 bg-blue-600 rounded-full group-hover:scale-150 transition-transform"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pressure Overview</h3>
            <p className="text-gray-600 text-sm">Detailed pressure situation analysis and methodology</p>
          </Link>

          <Link to="/player-comparison" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-12 h-12 text-purple-600" />
              <div className="w-3 h-3 bg-purple-600 rounded-full group-hover:scale-150 transition-transform"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Player Comparison</h3>
            <p className="text-gray-600 text-sm">Compare performance metrics across players</p>
          </Link>

          <Link to="/methodology" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-12 h-12 text-green-600" />
              <div className="w-3 h-3 bg-green-600 rounded-full group-hover:scale-150 transition-transform"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Methodology</h3>
            <p className="text-gray-600 text-sm">Complete analytical framework and calculations</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PressureHome;
