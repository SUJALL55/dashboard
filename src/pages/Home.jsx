import { useMemo } from 'react';
import { useData } from '../utils/DataContext';
import { 
  calculateBattingStats, 
  calculateBowlingStats, 
  getPointsTable,
  getTopBatsmen,
  getTopBowlers,
  getMatchResults,
} from '../utils/analytics';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { Trophy, Target, TrendingUp, Award, Calendar, Users } from 'lucide-react';

const Home = () => {
  const { ballByBall, matches, playerMapping, teams, competitions, loading, error } = useData();

  const analytics = useMemo(() => {
    if (!ballByBall.length || !matches.length) return null;

    const battingStats = calculateBattingStats(ballByBall, playerMapping);
    const bowlingStats = calculateBowlingStats(ballByBall, playerMapping);
    const pointsTable = getPointsTable(matches, teams);
    const topBatsmen = getTopBatsmen(battingStats, 5);
    const topBowlers = getTopBowlers(bowlingStats, 5);
    const recentMatches = matches
      .filter(m => [1358, 1715, 2193, 2725, 3298].includes(m.comp_id))
      .slice(-8)
      .reverse();

    const rrTeamId = 3;
    const rrMatches = getMatchResults(matches, rrTeamId);
    const rrStats = rrMatches.reduce(
      (acc, match) => {
        if ([1358, 1715, 2193, 2725, 3298].includes(match.comp_id)) {
          acc.played += 1;
          if (match.isWin) acc.won += 1;
        }
        return acc;
      },
      { played: 0, won: 0 }
    );

    return {
      battingStats,
      bowlingStats,
      pointsTable,
      topBatsmen,
      topBowlers,
      recentMatches,
      rrStats,
      featuredPlayer: topBatsmen[0] || { player_name: 'Loading...', runs: 0 },
      topBatter: topBatsmen[0] || { player_name: 'Loading...', runs: 0, strikeRate: 0 },
      topBowler: topBowlers[0] || { player_name: 'Loading...', wickets: 0, economy: 0 },
    };
  }, [ballByBall, matches, playerMapping, teams, competitions]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!analytics) return <div className="p-8 text-center">No data available</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Featured Player */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Featured Player */}
            <div className="md:col-span-2 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Most Wickets</p>
                  <h2 className="text-3xl font-bold">{analytics.featuredPlayer.player_name}</h2>
                  <p className="text-purple-100 text-sm mt-1">Top Performer</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <Award className="w-12 h-12" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-5xl font-bold">{analytics.featuredPlayer.runs}</p>
                  <p className="text-purple-100 text-sm mt-1">Total Runs</p>
                </div>
                <div>
                  <p className="text-5xl font-bold">{analytics.featuredPlayer.average}</p>
                  <p className="text-purple-100 text-sm mt-1">Average</p>
                </div>
                <div>
                  <p className="text-5xl font-bold">{analytics.featuredPlayer.strikeRate}</p>
                  <p className="text-purple-100 text-sm mt-1">Strike Rate</p>
                </div>
              </div>
            </div>

            {/* Key Stats */}
            <div className="space-y-3">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Matches Played</p>
                    <p className="text-3xl font-bold">{analytics.rrStats.played}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-300" />
                </div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Matches Won</p>
                    <p className="text-3xl font-bold">{analytics.rrStats.won}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Fixtures & Results */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Fixtures</h3>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                {analytics.recentMatches.slice(0, 5).map((match, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-3 py-2 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {match.home_team} vs {match.away_team}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(match.match_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {match.result}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column - Top Performers */}
          <div className="space-y-6">
            {/* Top Batsmen */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Batsmen</h3>
              <div className="space-y-3">
                {analytics.topBatsmen.slice(0, 5).map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{player.player_name}</p>
                        <p className="text-xs text-gray-500">
                          SR: {player.strikeRate} | Avg: {player.average}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{player.runs}</p>
                      <p className="text-xs text-gray-500">runs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Bowlers */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Bowlers</h3>
              <div className="space-y-3">
                {analytics.topBowlers.slice(0, 5).map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{player.player_name}</p>
                        <p className="text-xs text-gray-500">
                          Econ: {player.economy} | Avg: {player.average}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">{player.wickets}</p>
                      <p className="text-xs text-gray-500">wickets</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Points Table */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Points Table</h3>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">#</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">Team</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-700">M</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-700">W</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-700">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.pointsTable.slice(0, 10).map((team, index) => (
                      <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 ${team.team_id === 3 ? 'bg-blue-50 font-semibold' : ''}`}>
                        <td className="py-2 px-2 text-gray-600">{index + 1}</td>
                        <td className="py-2 px-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {team.team_name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-gray-900 truncate max-w-[120px]">{team.team_name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center text-gray-700">{team.matches}</td>
                        <td className="py-2 px-2 text-center text-gray-700">{team.wins}</td>
                        <td className="py-2 px-2 text-center font-bold text-blue-600">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Squad Overview */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Squad Overview</h3>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Total Players</span>
                  <span className="text-sm font-bold text-gray-900">{analytics.battingStats.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Active Batsmen</span>
                  <span className="text-sm font-bold text-blue-600">{analytics.battingStats.filter(p => p.balls > 30).length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Active Bowlers</span>
                  <span className="text-sm font-bold text-purple-600">{analytics.bowlingStats.filter(p => p.balls > 24).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
