import { useMemo, useState } from 'react';
import { useData } from '../utils/DataContext';
import { calculateBowlingStats, getUncappedPlayers } from '../utils/analytics';
import LoadingSpinner from '../components/LoadingSpinner';
import { Target, TrendingDown, Crosshair, Award, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const BowlingAnalytics = () => {
  const { ballByBall, playerMapping, competitions, loading, error } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('wickets');

  const analytics = useMemo(() => {
    if (!ballByBall.length || !playerMapping.length) return null;

    const allBowlingStats = calculateBowlingStats(ballByBall, playerMapping);
    const uncappedPlayers = getUncappedPlayers(playerMapping, competitions);
    
    const uncappedBowlers = allBowlingStats
      .filter(stat => 
        uncappedPlayers.some(p => p.player_id === stat.player_id) && 
        stat.balls >= 24
      )
      .map(stat => ({
        ...stat,
        impactScore: (stat.wickets * 20 - parseFloat(stat.economy) * 5).toFixed(1),
        consistency: parseFloat(stat.dotBallPercentage)
      }));

    return {
      uncappedBowlers,
      topUncapped: uncappedBowlers.slice(0, 10),
    };
  }, [ballByBall, playerMapping, competitions]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!analytics) return <div className="p-8 text-center">No data available</div>;

  const filteredBowlers = analytics.uncappedBowlers
    .filter(player => 
      player.player_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'wickets') return b.wickets - a.wickets;
      if (sortBy === 'economy') return parseFloat(a.economy) - parseFloat(b.economy);
      if (sortBy === 'average') {
        const avgA = a.average === '-' ? 999 : parseFloat(a.average);
        const avgB = b.average === '-' ? 999 : parseFloat(b.average);
        return avgA - avgB;
      }
      if (sortBy === 'strikeRate') {
        const srA = a.strikeRate === '-' ? 999 : parseFloat(a.strikeRate);
        const srB = b.strikeRate === '-' ? 999 : parseFloat(b.strikeRate);
        return srA - srB;
      }
      return 0;
    })
    .slice(0, 10);

  const chartData = filteredBowlers.map(player => ({
    name: player.player_name.split(' ').slice(-1)[0],
    wickets: player.wickets,
    economy: parseFloat(player.economy),
    dots: parseFloat(player.dotBallPercentage),
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bowling Analytics</h1>
          <p className="text-gray-600 mt-1">Top Uncapped Bowlers Performance Analysis</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Uncapped</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.uncappedBowlers.length}</p>
              </div>
              <Award className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Wickets</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics.uncappedBowlers.reduce((sum, p) => sum + p.wickets, 0)}
                </p>
              </div>
              <Target className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Best Economy</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.min(...analytics.uncappedBowlers.map(p => parseFloat(p.economy))).toFixed(2)}
                </p>
              </div>
              <TrendingDown className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Dot Ball %</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(analytics.uncappedBowlers.reduce((sum, p) => sum + p.consistency, 0) / analytics.uncappedBowlers.length).toFixed(1)}%
                </p>
              </div>
              <Crosshair className="w-10 h-10 text-blue-600 opacity-20" />
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
                placeholder="Search bowlers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="wickets">Sort by Wickets</option>
              <option value="economy">Sort by Economy</option>
              <option value="average">Sort by Average</option>
              <option value="strikeRate">Sort by Strike Rate</option>
            </select>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Wickets Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="wickets" fill="#8B5CF6" name="Wickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Economy & Dot Ball %</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="economy" stroke="#10B981" strokeWidth={2} name="Economy" />
                <Line type="monotone" dataKey="dots" stroke="#3B82F6" strokeWidth={2} name="Dot Ball %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Top 10 Uncapped Bowlers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Wickets</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Overs</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Runs</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Economy</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Strike Rate</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Dot Ball %</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBowlers.map((player, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{player.player_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-bold text-red-600">{player.wickets}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{player.overs}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{player.runs}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-green-600">{player.economy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-blue-600">{player.average}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{player.strikeRate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-indigo-600">{player.dotBallPercentage}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-bold text-purple-600">{player.impactScore}</div>
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

export default BowlingAnalytics;
