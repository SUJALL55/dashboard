import { useMemo } from 'react';
import { useData } from '../utils/DataContext';
import { calculateBattingStats, calculateBowlingStats, getUncappedPlayers } from '../utils/analytics';
import LoadingSpinner from '../components/LoadingSpinner';
import { DollarSign, Users, TrendingUp, Target, Award, CheckCircle } from 'lucide-react';

const AuctionStrategy = () => {
  const { ballByBall, playerMapping, competitions, loading, error } = useData();

  const analytics = useMemo(() => {
    if (!ballByBall.length || !playerMapping.length) return null;

    const allBattingStats = calculateBattingStats(ballByBall, playerMapping);
    const allBowlingStats = calculateBowlingStats(ballByBall, playerMapping);
    const uncappedPlayers = getUncappedPlayers(playerMapping, competitions);

    // Get top uncapped batsmen
    const uncappedBatsmen = allBattingStats
      .filter(stat => 
        uncappedPlayers.some(p => p.player_id === stat.player_id) && 
        stat.balls >= 50
      )
      .map(stat => ({
        ...stat,
        role: 'Batsman',
        impactScore: (parseFloat(stat.strikeRate) * 0.6 + parseFloat(stat.average) * 0.4).toFixed(1),
        recommendation: parseFloat(stat.strikeRate) > 140 ? 'High Priority' : parseFloat(stat.strikeRate) > 120 ? 'Medium Priority' : 'Low Priority',
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 15);

    // Get top uncapped bowlers
    const uncappedBowlers = allBowlingStats
      .filter(stat => 
        uncappedPlayers.some(p => p.player_id === stat.player_id) && 
        stat.balls >= 48
      )
      .map(stat => ({
        ...stat,
        role: 'Bowler',
        impactScore: (stat.wickets * 20 - parseFloat(stat.economy) * 5).toFixed(1),
        recommendation: stat.wickets > 15 ? 'High Priority' : stat.wickets > 10 ? 'Medium Priority' : 'Low Priority',
      }))
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 15);

    // Get all-rounders (players who bat and bowl)
    const allRounders = uncappedBatsmen
      .filter(batsman => 
        uncappedBowlers.some(bowler => bowler.player_id === batsman.player_id)
      )
      .map(batsman => {
        const bowlerStat = uncappedBowlers.find(b => b.player_id === batsman.player_id);
        return {
          ...batsman,
          role: 'All-Rounder',
          wickets: bowlerStat?.wickets || 0,
          economy: bowlerStat?.economy || '-',
          recommendation: 'High Priority',
        };
      });

    const squadRequirements = [
      {
        role: 'Opening Batsmen',
        current: 0,
        required: 2,
        priority: 'High',
        description: 'Aggressive stroke-players with high strike rates in powerplay',
        targets: uncappedBatsmen.slice(0, 3),
      },
      {
        role: 'Middle-Order Batsmen',
        current: 0,
        required: 3,
        priority: 'High',
        description: 'Anchor players who can build innings and accelerate',
        targets: uncappedBatsmen.slice(3, 6),
      },
      {
        role: 'Finishers',
        current: 0,
        required: 2,
        priority: 'High',
        description: 'Power-hitters with high SR in death overs (16-20)',
        targets: uncappedBatsmen.filter(p => parseFloat(p.strikeRate) > 150).slice(0, 2),
      },
      {
        role: 'Fast Bowlers',
        current: 0,
        required: 4,
        priority: 'High',
        description: 'Pace bowlers with wicket-taking ability and economy',
        targets: uncappedBowlers.slice(0, 4),
      },
      {
        role: 'Spinners',
        current: 0,
        required: 2,
        priority: 'Medium',
        description: 'Middle-overs specialists with control and variations',
        targets: uncappedBowlers.slice(4, 6),
      },
      {
        role: 'All-Rounders',
        current: 0,
        required: 2,
        priority: 'High',
        description: 'Balanced players contributing in both departments',
        targets: allRounders.slice(0, 2),
      },
      {
        role: 'Wicket-Keeper',
        current: 0,
        required: 1,
        priority: 'High',
        description: 'Keeper-batsman with good strike rate',
        targets: uncappedBatsmen.slice(0, 1),
      },
    ];

    const topRecommendations = [
      ...uncappedBatsmen.filter(p => p.recommendation === 'High Priority').slice(0, 5),
      ...uncappedBowlers.filter(p => p.recommendation === 'High Priority').slice(0, 5),
      ...allRounders.slice(0, 3),
    ];

    return {
      uncappedBatsmen,
      uncappedBowlers,
      allRounders,
      squadRequirements,
      topRecommendations,
    };
  }, [ballByBall, playerMapping, competitions]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!analytics) return <div className="p-8 text-center">No data available</div>;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High Priority':
      case 'High':
        return 'text-red-600 bg-red-100';
      case 'Medium Priority':
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Auction Strategy 2027</h1>
          <p className="text-gray-600 mt-1">Rajasthan Royals Squad Requirements & Player Recommendations</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Targets</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.topRecommendations.length}</p>
              </div>
              <Target className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics.topRecommendations.filter(p => p.recommendation === 'High Priority').length}
                </p>
              </div>
              <Award className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">All-Rounders</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.allRounders.length}</p>
              </div>
              <Users className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Budget Status</p>
                <p className="text-2xl font-bold text-green-600">Available</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Squad Requirements */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Squad Requirements Analysis</h2>
          <div className="space-y-4">
            {analytics.squadRequirements.map((req, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {req.role}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(req.priority)}`}>
                      {req.priority} Priority
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Required</p>
                    <p className="text-lg font-bold text-blue-600">{req.required}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{req.description}</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Top Targets:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {req.targets.slice(0, 3).map((target, idx) => (
                      <div key={idx} className="bg-white rounded p-2 border border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{target.player_name}</p>
                        <div className="flex items-center justify-between mt-1">
                          {target.runs !== undefined && (
                            <span className="text-xs text-blue-600">Runs: {target.runs}</span>
                          )}
                          {target.wickets !== undefined && (
                            <span className="text-xs text-purple-600">Wkts: {target.wickets}</span>
                          )}
                          {target.strikeRate && (
                            <span className="text-xs text-green-600">SR: {target.strikeRate}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-xl font-bold">Top Auction Recommendations</h2>
            <p className="text-sm text-blue-100 mt-1">Priority targets based on performance analysis</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Key Stats</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Score</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rationale</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topRecommendations.slice(0, 15).map((player, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {player.player_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{player.player_name}</div>
                          <div className="text-xs text-gray-500">{player.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {player.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm">
                        {player.role.includes('Batsman') || player.role.includes('All') ? (
                          <>
                            <div className="text-blue-600 font-semibold">{player.runs} runs</div>
                            <div className="text-xs text-gray-500">SR: {player.strikeRate}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-purple-600 font-semibold">{player.wickets} wkts</div>
                            <div className="text-xs text-gray-500">Econ: {player.economy}</div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-lg font-bold text-indigo-600">{player.impactScore}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(player.recommendation)}`}>
                        {player.recommendation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600 max-w-xs">
                        {player.role.includes('Batsman') 
                          ? `Consistent run-scorer with ${player.average} average and ${player.boundaries} boundaries`
                          : `Wicket-taker with ${player.wickets} dismissals and ${player.economy} economy rate`
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategy Summary */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2" />
            Auction Strategy Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-3">Key Focus Areas:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Prioritize explosive batsmen with strike rates above 140</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Target economical bowlers with wicket-taking ability</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Invest in quality all-rounders for team balance</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Secure death-over specialists for both batting and bowling</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Auction Tactics:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Use RTM cards wisely on proven performers</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Target uncapped players early for value deals</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Build a balanced squad with depth in all departments</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Reserve budget for marquee all-rounders</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionStrategy;
