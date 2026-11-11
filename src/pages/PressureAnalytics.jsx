import { useMemo } from 'react';
import { useData } from '../utils/DataContext';
import { calculateBattingStats, calculateBowlingStats } from '../utils/analytics';
import LoadingSpinner from '../components/LoadingSpinner';
import { Flame, Clock, Target, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const PressureAnalytics = () => {
  const { ballByBall, loading, error } = useData();

  const analytics = useMemo(() => {
    if (!ballByBall.length) return null;

    // Death overs (16-20)
    const deathOvers = ballByBall.filter(ball => {
      const over = ball.overid;
      return over >= 16 && over <= 20;
    });

    // Powerplay (1-6)
    const powerplay = ballByBall.filter(ball => {
      const over = ball.overid;
      return over >= 1 && over <= 6;
    });

    // Middle overs (7-15)
    const middleOvers = ballByBall.filter(ball => {
      const over = ball.overid;
      return over >= 7 && over <= 15;
    });

    const getPhaseStats = (balls) => {
      const runs = balls.reduce((sum, ball) => sum + (ball.runs || 0), 0);
      const wickets = balls.filter(ball => ball.is_wicket).length;
      const boundaries = balls.filter(ball => ball.is_four || ball.is_six).length;
      const dots = balls.filter(ball => ball.runs === 0 && !ball.extras_type).length;
      
      return {
        balls: balls.length,
        runs,
        wickets,
        boundaries,
        dots,
        runRate: balls.length > 0 ? ((runs / balls.length) * 6).toFixed(2) : '0.00',
        dotBallPercentage: balls.length > 0 ? ((dots / balls.length) * 100).toFixed(1) : '0.0',
      };
    };

    const deathStats = getPhaseStats(deathOvers);
    const powerplayStats = getPhaseStats(powerplay);
    const middleStats = getPhaseStats(middleOvers);

    // Top performers under pressure (death overs)
    const deathBatsmen = {};
    const deathBowlers = {};

    deathOvers.forEach(ball => {
      if (ball.striker_id) {
        if (!deathBatsmen[ball.striker_id]) {
          deathBatsmen[ball.striker_id] = {
            player_id: ball.striker_id,
            player_name: ball.striker_name,
            runs: 0,
            balls: 0,
            boundaries: 0,
          };
        }
        deathBatsmen[ball.striker_id].runs += ball.runs || 0;
        deathBatsmen[ball.striker_id].balls += 1;
        if (ball.is_four || ball.is_six) deathBatsmen[ball.striker_id].boundaries += 1;
      }

      if (ball.bowler_id) {
        if (!deathBowlers[ball.bowler_id]) {
          deathBowlers[ball.bowler_id] = {
            player_id: ball.bowler_id,
            player_name: ball.bowler_name,
            runs: 0,
            wickets: 0,
            balls: 0,
          };
        }
        deathBowlers[ball.bowler_id].runs += ball.runs || 0;
        deathBowlers[ball.bowler_id].balls += 1;
        if (ball.is_wicket) deathBowlers[ball.bowler_id].wickets += 1;
      }
    });

    const topDeathBatsmen = Object.values(deathBatsmen)
      .filter(p => p.balls >= 12)
      .map(p => ({
        ...p,
        strikeRate: ((p.runs / p.balls) * 100).toFixed(2),
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 10);

    const topDeathBowlers = Object.values(deathBowlers)
      .filter(p => p.balls >= 12)
      .map(p => ({
        ...p,
        economy: ((p.runs / p.balls) * 6).toFixed(2),
      }))
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 10);

    const phaseComparison = [
      { phase: 'Powerplay', runs: powerplayStats.runs, wickets: powerplayStats.wickets, runRate: parseFloat(powerplayStats.runRate) },
      { phase: 'Middle', runs: middleStats.runs, wickets: middleStats.wickets, runRate: parseFloat(middleStats.runRate) },
      { phase: 'Death', runs: deathStats.runs, wickets: deathStats.wickets, runRate: parseFloat(deathStats.runRate) },
    ];

    return {
      deathStats,
      powerplayStats,
      middleStats,
      topDeathBatsmen,
      topDeathBowlers,
      phaseComparison,
    };
  }, [ballByBall]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!analytics) return <div className="p-8 text-center">No data available</div>;

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pressure Analytics</h1>
          <p className="text-gray-600 mt-1">Performance Analysis in Critical Match Situations</p>
        </div>

        {/* Methodology */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Flame className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Methodology</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-bold mb-2">Powerplay (1-6 overs)</h3>
              <p className="text-sm">Field restrictions create attacking opportunities. Batsmen must capitalize while bowlers need control.</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-bold mb-2">Middle Overs (7-15)</h3>
              <p className="text-sm">Building phase requiring smart batting and tactical bowling to set up the finish.</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-bold mb-2">Death Overs (16-20)</h3>
              <p className="text-sm">Highest pressure phase. Batsmen accelerate aggressively while bowlers defend totals.</p>
            </div>
          </div>
        </div>

        {/* Phase Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Powerplay</h3>
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Runs Scored</span>
                <span className="font-bold text-blue-600">{analytics.powerplayStats.runs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wickets</span>
                <span className="font-bold text-red-600">{analytics.powerplayStats.wickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Run Rate</span>
                <span className="font-bold text-green-600">{analytics.powerplayStats.runRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Boundaries</span>
                <span className="font-bold text-purple-600">{analytics.powerplayStats.boundaries}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Middle Overs</h3>
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Runs Scored</span>
                <span className="font-bold text-blue-600">{analytics.middleStats.runs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wickets</span>
                <span className="font-bold text-red-600">{analytics.middleStats.wickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Run Rate</span>
                <span className="font-bold text-green-600">{analytics.middleStats.runRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Boundaries</span>
                <span className="font-bold text-purple-600">{analytics.middleStats.boundaries}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Death Overs</h3>
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Runs Scored</span>
                <span className="font-bold text-blue-600">{analytics.deathStats.runs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wickets</span>
                <span className="font-bold text-red-600">{analytics.deathStats.wickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Run Rate</span>
                <span className="font-bold text-green-600">{analytics.deathStats.runRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Boundaries</span>
                <span className="font-bold text-purple-600">{analytics.deathStats.boundaries}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Comparison Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Phase-wise Performance Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.phaseComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="phase" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="runs" fill="#3B82F6" name="Runs" />
              <Bar dataKey="wickets" fill="#EF4444" name="Wickets" />
              <Bar dataKey="runRate" fill="#10B981" name="Run Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Death Over Batsmen */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <h2 className="text-xl font-bold">Death Over Specialists (Batting)</h2>
              <p className="text-sm text-orange-100 mt-1">Top performers in overs 16-20</p>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {analytics.topDeathBatsmen.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{player.player_name}</p>
                        <p className="text-xs text-gray-500">SR: {player.strikeRate} | Balls: {player.balls}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{player.runs}</p>
                      <p className="text-xs text-gray-500">runs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Death Over Bowlers */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <h2 className="text-xl font-bold">Death Over Specialists (Bowling)</h2>
              <p className="text-sm text-purple-100 mt-1">Top performers in overs 16-20</p>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {analytics.topDeathBowlers.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{player.player_name}</p>
                        <p className="text-xs text-gray-500">Econ: {player.economy} | Balls: {player.balls}</p>
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
        </div>
      </div>
    </div>
  );
};

export default PressureAnalytics;
