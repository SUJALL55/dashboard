import { useMemo, useState } from 'react';
import { useData } from '../utils/DataContext';
import { calculateBattingStats, getUncappedPlayers } from '../utils/analytics';
import LoadingSpinner from '../components/LoadingSpinner';
import { TrendingUp, Target, Zap, Award, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BattingAnalytics = () => {
  const { ballByBall, playerMapping, competitions, loading, error } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('runs');

  const analytics = useMemo(() => {
    if (!ballByBall.length || !playerMapping.length) return null;

    const allBattingStats = calculateBattingStats(ballByBall, playerMapping);
    const uncappedPlayers = getUncappedPlayers(playerMapping, competitions);
    
    const uncappedBatsmen = allBattingStats
      .filter(stat => 
        uncappedPlayers.some(p => p.player_id === stat.player_id) && 
        stat.balls >= 30
      )
      .map(stat => ({
        ...stat,
        consistency: ((stat.runs / stat.balls) * 100).toFixed(1),
        impactScore: (parseFloat(stat.strikeRate) * 0.6 + parseFloat(stat.average) * 0.4).toFixed(1)
      }));

    return {
      uncappedBatsmen,
      topUncapped: uncappedBatsmen.slice(0, 10),
    };
  }, [ballByBall, playerMapping, competitions]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!analytics) return <div className="p-8 text-center">No data available</div>;

  const filteredBatsmen = analytics.uncappedBatsmen
    .filter(player => 
      player.player_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'runs') return b.runs - a.runs;
      if (sortBy === 'average') return parseFloat(b.average) - parseFloat(a.average);
      if (sortBy === 'strikeRate') return parseFloat(b.strikeRate) - parseFloat(a.strikeRate);
      if (sortBy === 'boundaries') return b.boundaries - a.boundaries;
      return 0;
    })
    .slice(0, 10);

  const chartData = filteredBatsmen.map(player => ({
    name: player.player_name.split(' ').slice(-1)[0],
    runs: player.runs,
    avg: parseFloat(player.average),
    sr: parseFloat(player.strikeRate),
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Batting Analytics</h1>
          <p className="text-gray-600 mt-1">Top Uncapped Batsmen Performance Analysis</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Uncapped</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.uncappedBatsmen.length}</p>
              </div>
              <Award className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Runs/Player</p>
                <p className="text-2xl font-bold text-green-600">
                  {(analytics.uncappedBatsmen.reduce((sum, p) => sum + p.runs, 0) / analytics.uncappedBatsmen.length).toFixed(0)}
                </p>
              </div>
              <Target className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Highest Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.max(...analytics.uncappedBatsmen.map(p => p.runs))}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Best Strike Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.max(...analytics.uncappedBatsmen.map(p => parseFloat(p.strikeRate))).toFixed(1)}
                </p>
              </div>
              <Zap className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search batsmen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="runs">Sort by Runs</option>
              <option value="average">Sort by Average</option>
              <option value="strikeRate">Sort by Strike Rate</option>
              <option value="boundaries">Sort by Boundaries</option>
            </select>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top 10 Performance Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="runs" fill="#3B82F6" name="Runs" />
              <Bar dataKey="sr" fill="#8B5CF6" name="Strike Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Top 10 Uncapped Batsmen</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Runs</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Balls</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Strike Rate</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">4s</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">6s</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Boundaries</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBatsmen.map((player, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{player.player_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-bold text-blue-600">{player.runs}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{player.balls}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-green-600">{player.average}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-purple-600">{player.strikeRate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{player.fours}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{player.sixes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-orange-600">{player.boundaries}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-bold text-indigo-600">{player.impactScore}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattingAnalytics;
