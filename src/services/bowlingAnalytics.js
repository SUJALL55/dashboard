/**
 * BOWLING RELIABILITY ANALYTICS ENGINE
 * 
 * Calculates bowling performance under pressure vs normal conditions.
 * Generates bowling reliability index for ranking.
 * 
 * CRITICAL: Excludes run-outs from bowler wicket counts (not bowler's wicket)
 * CRITICAL: Handles extras correctly (wides/no-balls are runs conceded)
 */

// Calculate bowling statistics by pressure category
export const calculateBowlingStats = (enrichedData, playerMapping) => {
  const playerStats = {};

  enrichedData.forEach(ball => {
    const bowlerId = ball.bowler_id;
    if (!bowlerId) return;

    if (!playerStats[bowlerId]) {
      playerStats[bowlerId] = {
        player_id: bowlerId,
        player_name: ball.bowler_name,
        matches: new Set(),
        
        // Overall stats
        total_balls: 0, // Legal deliveries
        total_legal_balls: 0, // Excluding wides/no-balls
        total_runs: 0, // Including extras
        total_wickets: 0, // Excluding run-outs
        total_dots: 0,
        total_fours: 0,
        total_sixes: 0,
        total_wides: 0,
        total_noballs: 0,
        
        // Pressure stats (60+)
        pressure_balls: 0,
        pressure_legal_balls: 0,
        pressure_runs: 0,
        pressure_wickets: 0,
        pressure_dots: 0,
        pressure_fours: 0,
        pressure_sixes: 0,
        pressure_matches: new Set(),
        
        // High + Extreme pressure (60+)
        high_pressure_balls: 0,
        high_pressure_runs: 0,
        high_pressure_wickets: 0,
        
        // Normal stats (<60)
        normal_balls: 0,
        normal_legal_balls: 0,
        normal_runs: 0,
        normal_wickets: 0,
        normal_dots: 0,
        normal_fours: 0,
        normal_sixes: 0,
        
        // Phase-wise stats
        powerplay_balls: 0,
        powerplay_runs: 0,
        powerplay_wickets: 0,
        death_balls: 0,
        death_runs: 0,
        death_wickets: 0,
      };
    }

    const stats = playerStats[bowlerId];
    const runs = ball.runs || 0;
    const extras = calculateExtras(ball);
    const totalRunsConceded = runs + extras;
    const isPressure = ball.pressure_index >= 60;
    const isLegal = !ball.extras_type || ball.extras_type === 'None' || 
                    !['wide', 'noball'].includes(ball.extras_type?.toLowerCase());

    // Track matches
    stats.matches.add(ball.match_id);
    
    // Overall stats
    stats.total_balls += 1;
    if (isLegal) stats.total_legal_balls += 1;
    stats.total_runs += totalRunsConceded;
    
    // Wickets (EXCLUDE RUN-OUTS)
    if (ball.is_wicket && ball.dismissal_type !== 'Run Out' && ball.dismissal_type !== 'Retired Hurt') {
      stats.total_wickets += 1;
    }
    
    if (runs === 0 && !ball.extras_type) stats.total_dots += 1;
    if (ball.is_four) stats.total_fours += 1;
    if (ball.is_six) stats.total_sixes += 1;
    if (ball.extras_type === 'wide') stats.total_wides += 1;
    if (ball.extras_type === 'noball') stats.total_noballs += 1;

    // Phase-wise stats
    const over = ball.overid;
    if (over <= 6) {
      stats.powerplay_balls += 1;
      stats.powerplay_runs += totalRunsConceded;
      if (ball.is_wicket && ball.dismissal_type !== 'Run Out') {
        stats.powerplay_wickets += 1;
      }
    } else if (over >= 16) {
      stats.death_balls += 1;
      stats.death_runs += totalRunsConceded;
      if (ball.is_wicket && ball.dismissal_type !== 'Run Out') {
        stats.death_wickets += 1;
      }
    }

    // Pressure vs Normal split
    if (isPressure) {
      stats.pressure_balls += 1;
      if (isLegal) stats.pressure_legal_balls += 1;
      stats.pressure_runs += totalRunsConceded;
      stats.pressure_matches.add(ball.match_id);
      
      if (ball.is_wicket && ball.dismissal_type !== 'Run Out') {
        stats.pressure_wickets += 1;
      }
      if (runs === 0 && !ball.extras_type) stats.pressure_dots += 1;
      if (ball.is_four) stats.pressure_fours += 1;
      if (ball.is_six) stats.pressure_sixes += 1;
      
      if (ball.pressure_index >= 60) {
        stats.high_pressure_balls += 1;
        stats.high_pressure_runs += totalRunsConceded;
        if (ball.is_wicket && ball.dismissal_type !== 'Run Out') {
          stats.high_pressure_wickets += 1;
        }
      }
    } else {
      stats.normal_balls += 1;
      if (isLegal) stats.normal_legal_balls += 1;
      stats.normal_runs += totalRunsConceded;
      
      if (ball.is_wicket && ball.dismissal_type !== 'Run Out') {
        stats.normal_wickets += 1;
      }
      if (runs === 0 && !ball.extras_type) stats.normal_dots += 1;
      if (ball.is_four) stats.normal_fours += 1;
      if (ball.is_six) stats.normal_sixes += 1;
    }
  });

  // Convert sets and calculate derived metrics
  return Object.values(playerStats).map(stats => {
    const matchCount = stats.matches.size;
    const pressureMatchCount = stats.pressure_matches.size;

    // Overs (legal balls / 6)
    const totalOvers = stats.total_legal_balls / 6;
    const pressureOvers = stats.pressure_legal_balls / 6;
    const normalOvers = stats.normal_legal_balls / 6;

    // Economy rates
    const totalEconomy = totalOvers > 0 ? stats.total_runs / totalOvers : 0;
    const pressureEconomy = pressureOvers > 0 ? stats.pressure_runs / pressureOvers : 0;
    const normalEconomy = normalOvers > 0 ? stats.normal_runs / normalOvers : 0;

    // Bowling averages
    const totalAverage = stats.total_wickets > 0 ? stats.total_runs / stats.total_wickets : 999;
    const pressureAverage = stats.pressure_wickets > 0 ? stats.pressure_runs / stats.pressure_wickets : 999;
    const normalAverage = stats.normal_wickets > 0 ? stats.normal_runs / stats.normal_wickets : 999;

    // Strike rates (balls per wicket)
    const totalSR = stats.total_wickets > 0 ? stats.total_legal_balls / stats.total_wickets : 999;
    const pressureSR = stats.pressure_wickets > 0 ? stats.pressure_legal_balls / stats.pressure_wickets : 999;
    const normalSR = stats.normal_wickets > 0 ? stats.normal_legal_balls / stats.normal_wickets : 999;

    // Dot ball percentages
    const totalDotPct = stats.total_legal_balls > 0 ? (stats.total_dots / stats.total_legal_balls) * 100 : 0;
    const pressureDotPct = stats.pressure_legal_balls > 0 ? (stats.pressure_dots / stats.pressure_legal_balls) * 100 : 0;
    const normalDotPct = stats.normal_legal_balls > 0 ? (stats.normal_dots / stats.normal_legal_balls) * 100 : 0;

    // Boundary concession percentages
    const totalBoundaryPct = stats.total_legal_balls > 0 ? ((stats.total_fours + stats.total_sixes) / stats.total_legal_balls) * 100 : 0;
    const pressureBoundaryPct = stats.pressure_legal_balls > 0 ? ((stats.pressure_fours + stats.pressure_sixes) / stats.pressure_legal_balls) * 100 : 0;
    const normalBoundaryPct = stats.normal_legal_balls > 0 ? ((stats.normal_fours + stats.normal_sixes) / stats.normal_legal_balls) * 100 : 0;

    // Wickets per over
    const totalWPO = totalOvers > 0 ? stats.total_wickets / totalOvers : 0;
    const pressureWPO = pressureOvers > 0 ? stats.pressure_wickets / pressureOvers : 0;
    const normalWPO = normalOvers > 0 ? stats.normal_wickets / normalOvers : 0;

    return {
      ...stats,
      matches: matchCount,
      pressure_matches: pressureMatchCount,
      
      total_overs: totalOvers,
      pressure_overs: pressureOvers,
      normal_overs: normalOvers,
      
      total_economy: totalEconomy,
      pressure_economy: pressureEconomy,
      normal_economy: normalEconomy,
      economy_diff: pressureEconomy - normalEconomy,
      
      total_average: totalAverage,
      pressure_average: pressureAverage,
      normal_average: normalAverage,
      
      total_strike_rate: totalSR,
      pressure_strike_rate: pressureSR,
      normal_strike_rate: normalSR,
      
      total_dot_pct: totalDotPct,
      pressure_dot_pct: pressureDotPct,
      normal_dot_pct: normalDotPct,
      
      total_boundary_pct: totalBoundaryPct,
      pressure_boundary_pct: pressureBoundaryPct,
      normal_boundary_pct: normalBoundaryPct,
      
      total_wickets_per_over: totalWPO,
      pressure_wickets_per_over: pressureWPO,
      normal_wickets_per_over: normalWPO,
    };
  });
};

// Helper to calculate extras
const calculateExtras = (ball) => {
  if (!ball.extras_type || ball.extras_type === 'None') return 0;
  return (ball.extras1_runs || 0) + (ball.extras_2_runs || 0);
};

// Calculate bowling reliability index
export const calculateBowlingReliability = (bowlingStats) => {
  return bowlingStats.map(stats => {
    // Eligibility check (minimum 24 pressure balls = 4 overs)
    const eligible = stats.pressure_legal_balls >= 24 && stats.pressure_matches >= 5;
    
    if (!eligible) {
      return {
        ...stats,
        eligible: false,
        reliability_score: 0,
        confidence_level: 'Insufficient Data',
      };
    }

    // Component 1: Economy Control Under Pressure (40 points)
    // Lower economy is better; comparison to normal
    let economyScore = 0;
    if (stats.normal_economy > 0) {
      const economyRatio = stats.pressure_economy / stats.normal_economy;
      if (economyRatio <= 1.0) {
        economyScore = 40; // Maintained or improved
      } else if (economyRatio <= 1.1) {
        economyScore = 35; // Slight increase
      } else if (economyRatio <= 1.2) {
        economyScore = 25; // Moderate increase
      } else {
        economyScore = 15; // Significant increase
      }
    } else {
      // No normal baseline, use absolute pressure economy
      if (stats.pressure_economy <= 7.0) economyScore = 40;
      else if (stats.pressure_economy <= 8.5) economyScore = 30;
      else if (stats.pressure_economy <= 10.0) economyScore = 20;
      else economyScore = 10;
    }

    // Component 2: Wicket-Taking Ability (25 points)
    const wicketScore = Math.min((stats.pressure_wickets / 8) * 25, 25);

    // Component 3: Dot Ball Production (15 points)
    const dotScore = Math.min((stats.pressure_dot_pct / 50) * 15, 15);

    // Component 4: Boundary Prevention (10 points)
    // Lower is better
    const boundaryScore = Math.max(10 - (stats.pressure_boundary_pct / 3), 0);

    // Component 5: Consistency (10 points)
    const consistencyScore = Math.min((stats.pressure_matches / 10) * 10, 10);

    // Total reliability score (0-100)
    const reliabilityScore = economyScore + wicketScore + dotScore + boundaryScore + consistencyScore;

    // Sample size adjustment (shrinkage towards mean)
    const sampleWeight = Math.min(stats.pressure_legal_balls / 60, 1);
    const adjustedScore = reliabilityScore * sampleWeight;

    // Confidence level
    let confidenceLevel = 'Low';
    if (stats.pressure_legal_balls >= 72 && stats.pressure_matches >= 10) {
      confidenceLevel = 'High';
    } else if (stats.pressure_legal_balls >= 48 && stats.pressure_matches >= 7) {
      confidenceLevel = 'Medium';
    }

    return {
      ...stats,
      eligible: true,
      reliability_score: Math.round(adjustedScore * 10) / 10,
      unadjusted_score: Math.round(reliabilityScore * 10) / 10,
      confidence_level: confidenceLevel,
      economy_component: Math.round(economyScore * 10) / 10,
      wicket_component: Math.round(wicketScore * 10) / 10,
      dot_component: Math.round(dotScore * 10) / 10,
      boundary_component: Math.round(boundaryScore * 10) / 10,
      consistency_component: Math.round(consistencyScore * 10) / 10,
    };
  });
};

// Get top N bowlers by reliability
export const getTopBowlers = (bowlingReliability, n = 10) => {
  return bowlingReliability
    .filter(b => b.eligible)
    .sort((a, b) => b.reliability_score - a.reliability_score)
    .slice(0, n)
    .map((bowler, index) => ({
      rank: index + 1,
      ...bowler,
    }));
};

export default {
  calculateBowlingStats,
  calculateBowlingReliability,
  getTopBowlers,
};
