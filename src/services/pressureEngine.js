/**
 * PRESSURE DETECTION ENGINE
 * 
 * Calculates ball-by-ball pressure index (0-100) based on match context.
 * 
 * Methodology:
 * - Innings 1: Wickets lost, scoring rate, phase
 * - Innings 2: Required run rate, wickets, balls remaining, target proximity
 * 
 * Pressure Categories:
 * - Normal: 0-39
 * - Moderate: 40-59  
 * - High: 60-79
 * - Extreme: 80-100
 */

// Calculate cumulative match state for each delivery
export const calculateMatchState = (ballByBallData, matchesData) => {
  const matchStates = {};
  const inningsTargets = {};

  // Group by match and innings
  const grouped = ballByBallData.reduce((acc, ball) => {
    const key = `${ball.match_id}_${ball.innings}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ball);
    return acc;
  }, {});

  // Calculate states
  Object.keys(grouped).forEach(key => {
    const [matchId, innings] = key.split('_');
    const balls = grouped[key].sort((a, b) => a.innings_ball_num - b.innings_ball_num);
    
    let cumulativeRuns = 0;
    let cumulativeWickets = 0;
    
    balls.forEach((ball, idx) => {
      // Calculate runs including extras
      const ballRuns = (ball.runs || 0);
      const extras = calculateExtras(ball);
      const totalRuns = ballRuns + extras;
      
      cumulativeRuns += totalRuns;
      
      // Count wickets (exclude run-outs as they don't indicate batting/bowling pressure the same way)
      if (ball.is_wicket && ball.dismissal_type !== 'Run Out') {
        cumulativeWickets += 1;
      }
      
      const ballsRemaining = 120 - ball.innings_ball_num;
      const wicketsRemaining = 10 - cumulativeWickets;
      const currentRunRate = ball.innings_ball_num > 0 
        ? (cumulativeRuns / ball.innings_ball_num) * 6 
        : 0;
      
      // Store state
      matchStates[`${matchId}_${innings}_${ball.innings_ball_num}`] = {
        match_id: matchId,
        innings: parseInt(innings),
        ball_num: ball.innings_ball_num,
        over: ball.overid,
        cumulative_runs: cumulativeRuns,
        cumulative_wickets: cumulativeWickets,
        balls_remaining: ballsRemaining,
        wickets_remaining: wicketsRemaining,
        current_run_rate: currentRunRate,
      };
      
      // Store innings 1 total as target for innings 2
      if (parseInt(innings) === 1 && idx === balls.length - 1) {
        inningsTargets[matchId] = cumulativeRuns + 1; // Target to win
      }
    });
  });

  return { matchStates, inningsTargets };
};

// Calculate extras from a ball
const calculateExtras = (ball) => {
  if (!ball.extras_type || ball.extras_type === 'None') return 0;
  return (ball.extras1_runs || 0) + (ball.extras_2_runs || 0);
};

// Calculate pressure index for each delivery
export const calculatePressureIndex = (ball, matchState, target = null) => {
  const innings = ball.innings;
  let pressureScore = 0;
  
  if (innings === 2 && target) {
    // INNINGS 2: Chasing pressure
    const runsNeeded = target - matchState.cumulative_runs;
    const ballsRemaining = matchState.balls_remaining;
    const wicketsRemaining = matchState.wickets_remaining;
    
    // Required run rate (most critical factor)
    const requiredRunRate = ballsRemaining > 0 ? (runsNeeded / ballsRemaining) * 6 : 0;
    const rrPressure = Math.min(requiredRunRate * 8, 40); // Max 40 points
    
    // Wickets pressure (losing wickets increases pressure)
    const wicketsPressure = ((10 - wicketsRemaining) / 10) * 25; // Max 25 points
    
    // Balls remaining pressure (fewer balls = more pressure)
    const ballsPressure = ((120 - ballsRemaining) / 120) * 20; // Max 20 points
    
    // Match closeness (runs needed vs balls)
    const runsPerBallNeeded = ballsRemaining > 0 ? runsNeeded / ballsRemaining : 0;
    const closenessPressure = Math.min(runsPerBallNeeded * 10, 15); // Max 15 points
    
    pressureScore = rrPressure + wicketsPressure + ballsPressure + closenessPressure;
    
  } else {
    // INNINGS 1: Setting target pressure
    const wicketsLost = matchState.cumulative_wickets;
    const ballsUsed = ball.innings_ball_num;
    const currentScore = matchState.cumulative_runs;
    
    // Wickets lost pressure
    const wicketsPressure = (wicketsLost / 10) * 30; // Max 30 points
    
    // Phase pressure (death overs are high pressure)
    const over = ball.overid;
    let phasePressure = 0;
    if (over >= 16) {
      phasePressure = 25; // Death overs max pressure
    } else if (over >= 11) {
      phasePressure = 15; // Middle to death transition
    } else if (over >= 7) {
      phasePressure = 5; // Middle overs
    }
    
    // Scoring rate pressure (under-scoring creates pressure)
    const currentRunRate = matchState.current_run_rate;
    const expectedRunRate = 8.0; // Expected T20 run rate
    const runRateGap = Math.max(0, expectedRunRate - currentRunRate);
    const runRatePressure = Math.min(runRateGap * 3, 20); // Max 20 points
    
    // Balls remaining with wickets (few wickets + few balls = pressure)
    const resourcePressure = (wicketsLost / 10) * (ballsUsed / 120) * 25; // Max 25 points
    
    pressureScore = wicketsPressure + phasePressure + runRatePressure + resourcePressure;
  }
  
  // Normalize to 0-100
  pressureScore = Math.max(0, Math.min(100, pressureScore));
  
  return Math.round(pressureScore);
};

// Categorize pressure level
export const categorizePressure = (pressureIndex) => {
  if (pressureIndex >= 80) return 'Extreme';
  if (pressureIndex >= 60) return 'High';
  if (pressureIndex >= 40) return 'Moderate';
  return 'Normal';
};

// Process entire dataset with pressure calculations
export const enrichDataWithPressure = (ballByBallData, matchesData) => {
  const { matchStates, inningsTargets } = calculateMatchState(ballByBallData, matchesData);
  
  const enrichedData = ballByBallData.map(ball => {
    const stateKey = `${ball.match_id}_${ball.innings}_${ball.innings_ball_num}`;
    const matchState = matchStates[stateKey];
    
    if (!matchState) {
      return { ...ball, pressure_index: 0, pressure_category: 'Normal' };
    }
    
    const target = ball.innings === 2 ? inningsTargets[ball.match_id] : null;
    const pressureIndex = calculatePressureIndex(ball, matchState, target);
    const pressureCategory = categorizePressure(pressureIndex);
    
    return {
      ...ball,
      ...matchState,
      target,
      pressure_index: pressureIndex,
      pressure_category: pressureCategory,
    };
  });
  
  return enrichedData;
};

// Validate pressure calculation (for testing)
export const validatePressureEngine = (enrichedData) => {
  const stats = {
    total_balls: enrichedData.length,
    normal: enrichedData.filter(b => b.pressure_category === 'Normal').length,
    moderate: enrichedData.filter(b => b.pressure_category === 'Moderate').length,
    high: enrichedData.filter(b => b.pressure_category === 'High').length,
    extreme: enrichedData.filter(b => b.pressure_category === 'Extreme').length,
    avg_pressure: enrichedData.reduce((sum, b) => sum + b.pressure_index, 0) / enrichedData.length,
    innings1_avg: enrichedData.filter(b => b.innings === 1).reduce((sum, b) => sum + b.pressure_index, 0) / 
      enrichedData.filter(b => b.innings === 1).length,
    innings2_avg: enrichedData.filter(b => b.innings === 2).reduce((sum, b) => sum + b.pressure_index, 0) / 
      enrichedData.filter(b => b.innings === 2).length,
  };
  
  return stats;
};

export default {
  calculateMatchState,
  calculatePressureIndex,
  categorizePressure,
  enrichDataWithPressure,
  validatePressureEngine,
};
