/**
 * BATTING RELIABILITY ANALYTICS ENGINE
 * 
 * Calculates batting performance under pressure vs normal conditions.
 * Generates batting reliability index for ranking.
 */

// Calculate batting statistics by pressure category
export const calculateBattingStats = (enrichedData, playerMapping) => {
  const playerStats = {};

  enrichedData.forEach(ball => {
    const playerId = ball.striker_id;
    if (!playerId) return;

    if (!playerStats[playerId]) {
      playerStats[playerId] = {
        player_id: playerId,
        player_name: ball.striker_name,
        matches: new Set(),
        
        // Overall stats
        total_balls: 0,
        total_runs: 0,
        total_dismissals: 0,
        total_fours: 0,
        total_sixes: 0,
        total_dots: 0,
        
        // Pressure stats (60+)
        pressure_balls: 0,
        pressure_runs: 0,
        pressure_dismissals: 0,
        pressure_fours: 0,
        pressure_sixes: 0,
        pressure_dots: 0,
        pressure_matches: new Set(),
        
        // High + Extreme pressure stats (60+)
        high_pressure_balls: 0,
        high_pressure_runs: 0,
        high_pressure_dismissals: 0,
        
        // Normal stats (<60)
        normal_balls: 0,
        normal_runs: 0,
        normal_dismissals: 0,
        normal_fours: 0,
        normal_sixes: 0,
        normal_dots: 0,
        
        // Innings count
        innings: new Set(),
      };
    }

    const stats = playerStats[playerId];
    const runs = ball.runs || 0;
    const isPressure = ball.pressure_index >= 60;
    const isHighPressure = ball.pressure_index >= 60;

    // Track matches and innings
    stats.matches.add(ball.match_id);
    stats.innings.add(`${ball.match_id}_${ball.innings}`);
    
    // Overall stats
    stats.total_balls += 1;
    stats.total_runs += runs;
    if (ball.is_wicket && ball.dismissed_player_id === playerId) {
      stats.total_dismissals += 1;
    }
    if (ball.is_four) stats.total_fours += 1;
    if (ball.is_six) stats.total_sixes += 1;
    if (runs === 0 && !ball.extras_type) stats.total_dots += 1;

    // Pressure vs Normal split
    if (isPressure) {
      stats.pressure_balls += 1;
      stats.pressure_runs += runs;
      stats.pressure_matches.add(ball.match_id);
      if (ball.is_wicket && ball.dismissed_player_id === playerId) {
        stats.pressure_dismissals += 1;
      }
      if (ball.is_four) stats.pressure_fours += 1;
      if (ball.is_six) stats.pressure_sixes += 1;
      if (runs === 0 && !ball.extras_type) stats.pressure_dots += 1;
      
      if (isHighPressure) {
        stats.high_pressure_balls += 1;
        stats.high_pressure_runs += runs;
        if (ball.is_wicket && ball.dismissed_player_id === playerId) {
          stats.high_pressure_dismissals += 1;
        }
      }
    } else {
      stats.normal_balls += 1;
      stats.normal_runs += runs;
      if (ball.is_wicket && ball.dismissed_player_id === playerId) {
        stats.normal_dismissals += 1;
      }
      if (ball.is_four) stats.normal_fours += 1;
      if (ball.is_six) stats.normal_sixes += 1;
      if (runs === 0 && !ball.extras_type) stats.normal_dots += 1;
    }
  });

  // Convert sets to counts and calculate derived metrics
  return Object.values(playerStats).map(stats => {
    const matchCount = stats.matches.size;
    const pressureMatchCount = stats.pressure_matches.size;
    const inningsCount = stats.innings.size;

    // Strike rates
    const totalSR = stats.total_balls > 0 ? (stats.total_runs / stats.total_balls) * 100 : 0;
    const pressureSR = stats.pressure_balls > 0 ? (stats.pressure_runs / stats.pressure_balls) * 100 : 0;
    const normalSR = stats.normal_balls > 0 ? (stats.normal_runs / stats.normal_balls) * 100 : 0;

    // Batting averages
    const totalAvg = stats.total_dismissals > 0 ? stats.total_runs / stats.total_dismissals : stats.total_runs;
    const pressureAvg = stats.pressure_dismissals > 0 ? stats.pressure_runs / stats.pressure_dismissals : stats.pressure_runs;
    const normalAvg = stats.normal_dismissals > 0 ? stats.normal_runs / stats.normal_dismissals : stats.normal_runs;

    // Boundary percentages
    const totalBoundaryPct = stats.total_balls > 0 ? ((stats.total_fours + stats.total_sixes) / stats.total_balls) * 100 : 0;
    const pressureBoundaryPct = stats.pressure_balls > 0 ? ((stats.pressure_fours + stats.pressure_sixes) / stats.pressure_balls) * 100 : 0;
    const normalBoundaryPct = stats.normal_balls > 0 ? ((stats.normal_fours + stats.normal_sixes) / stats.normal_balls) * 100 : 0;

    // Dot ball percentages
    const totalDotPct = stats.total_balls > 0 ? (stats.total_dots / stats.total_balls) * 100 : 0;
    const pressureDotPct = stats.pressure_balls > 0 ? (stats.pressure_dots / stats.pressure_balls) * 100 : 0;
    const normalDotPct = stats.normal_balls > 0 ? (stats.normal_dots / stats.normal_balls) * 100 : 0;

    // Dismissal rates
    const totalDismissalRate = stats.total_balls > 0 ? (stats.total_dismissals / stats.total_balls) * 100 : 0;
    const pressureDismissalRate = stats.pressure_balls > 0 ? (stats.pressure_dismissals / stats.pressure_balls) * 100 : 0;
    const normalDismissalRate = stats.normal_balls > 0 ? (stats.normal_dismissals / stats.normal_balls) * 100 : 0;

    return {
      ...stats,
      matches: matchCount,
      pressure_matches: pressureMatchCount,
      innings: inningsCount,
      
      total_strike_rate: totalSR,
      pressure_strike_rate: pressureSR,
      normal_strike_rate: normalSR,
      strike_rate_diff: pressureSR - normalSR,
      
      total_average: totalAvg,
      pressure_average: pressureAvg,
      normal_average: normalAvg,
      
      total_boundary_pct: totalBoundaryPct,
      pressure_boundary_pct: pressureBoundaryPct,
      normal_boundary_pct: normalBoundaryPct,
      
      total_dot_pct: totalDotPct,
      pressure_dot_pct: pressureDotPct,
      normal_dot_pct: normalDotPct,
      
      total_dismissal_rate: totalDismissalRate,
      pressure_dismissal_rate: pressureDismissalRate,
      normal_dismissal_rate: normalDismissalRate,
    };
  });
};

// Calculate batting reliability index
export const calculateBattingReliability = (battingStats) => {
  return battingStats.map(stats => {
    // Eligibility check
    const eligible = stats.pressure_balls >= 30 && stats.pressure_matches >= 5;
    
    if (!eligible) {
      return {
        ...stats,
        eligible: false,
        reliability_score: 0,
        confidence_level: 'Insufficient Data',
      };
    }

    // Component 1: Strike Rate Maintenance (40 points)
    // Reward maintaining or improving SR under pressure
    let srScore = 0;
    if (stats.normal_strike_rate > 0) {
      const srRatio = stats.pressure_strike_rate / stats.normal_strike_rate;
      if (srRatio >= 1.0) {
        srScore = 40; // Maintained or improved
      } else if (srRatio >= 0.9) {
        srScore = 35; // Slight decline
      } else if (srRatio >= 0.8) {
        srScore = 25; // Moderate decline
      } else {
        srScore = 15; // Significant decline
      }
    } else {
      // No normal baseline, use absolute pressure SR
      if (stats.pressure_strike_rate >= 140) srScore = 40;
      else if (stats.pressure_strike_rate >= 120) srScore = 30;
      else if (stats.pressure_strike_rate >= 100) srScore = 20;
      else srScore = 10;
    }

    // Component 2: Boundary Production Under Pressure (20 points)
    const boundaryScore = Math.min((stats.pressure_boundary_pct / 25) * 20, 20);

    // Component 3: Dismissal Avoidance (20 points)
    // Lower dismissal rate is better
    const dismissalScore = Math.max(20 - (stats.pressure_dismissal_rate * 2), 0);

    // Component 4: Consistency (10 points)
    // Based on match-to-match exposure
    const consistencyScore = Math.min((stats.pressure_matches / 10) * 10, 10);

    // Component 5: High Pressure Performance (10 points)
    // Performance in extreme situations (80+)
    const highPressureRatio = stats.high_pressure_balls > 0 
      ? (stats.high_pressure_runs / stats.high_pressure_balls) * 100 
      : 0;
    const highPressureScore = Math.min((highPressureRatio / 150) * 10, 10);

    // Total reliability score (0-100)
    const reliabilityScore = srScore + boundaryScore + dismissalScore + consistencyScore + highPressureScore;

    // Sample size adjustment (shrinkage towards mean)
    const sampleWeight = Math.min(stats.pressure_balls / 100, 1);
    const adjustedScore = reliabilityScore * sampleWeight;

    // Confidence level
    let confidenceLevel = 'Low';
    if (stats.pressure_balls >= 100 && stats.pressure_matches >= 10) {
      confidenceLevel = 'High';
    } else if (stats.pressure_balls >= 60 && stats.pressure_matches >= 7) {
      confidenceLevel = 'Medium';
    }

    return {
      ...stats,
      eligible: true,
      reliability_score: Math.round(adjustedScore * 10) / 10,
      unadjusted_score: Math.round(reliabilityScore * 10) / 10,
      confidence_level: confidenceLevel,
      sr_component: Math.round(srScore * 10) / 10,
      boundary_component: Math.round(boundaryScore * 10) / 10,
      dismissal_component: Math.round(dismissalScore * 10) / 10,
      consistency_component: Math.round(consistencyScore * 10) / 10,
      high_pressure_component: Math.round(highPressureScore * 10) / 10,
    };
  });
};

// Get top N batters by reliability
export const getTopBatters = (battingReliability, n = 10) => {
  return battingReliability
    .filter(b => b.eligible)
    .sort((a, b) => b.reliability_score - a.reliability_score)
    .slice(0, n)
    .map((batter, index) => ({
      rank: index + 1,
      ...batter,
    }));
};

export default {
  calculateBattingStats,
  calculateBattingReliability,
  getTopBatters,
};
