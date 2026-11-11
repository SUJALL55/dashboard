/**
 * RANKING ENGINE
 * 
 * Generates final top 10 rankings for batters and bowlers under pressure.
 * Ensures no duplicates and proper data attribution.
 */

import { enrichDataWithPressure } from './pressureEngine';
import { calculateBattingStats, calculateBattingReliability, getTopBatters } from './battingAnalytics';
import { calculateBowlingStats, calculateBowlingReliability, getTopBowlers } from './bowlingAnalytics';
import { getPlayerTeams, getPlayerCompetitions } from './csvLoader';

// Generate complete analysis
export const generateCompleteAnalysis = (filteredData) => {
  const { ballByBall, matches, playerMapping, competitions } = filteredData;
  
  console.log('Step 1: Enriching data with pressure calculations...');
  const enrichedData = enrichDataWithPressure(ballByBall, matches);
  
  console.log('Step 2: Calculating batting statistics...');
  const battingStats = calculateBattingStats(enrichedData, playerMapping);
  
  console.log('Step 3: Calculating batting reliability scores...');
  const battingReliability = calculateBattingReliability(battingStats);
  
  console.log('Step 4: Calculating bowling statistics...');
  const bowlingStats = calculateBowlingStats(enrichedData, playerMapping);
  
  console.log('Step 5: Calculating bowling reliability scores...');
  const bowlingReliability = calculateBowlingReliability(bowlingStats);
  
  console.log('Step 6: Generating top 10 rankings...');
  const topBatters = getTopBatters(battingReliability, 10);
  const topBowlers = getTopBowlers(bowlingReliability, 10);
  
  // Enrich with team and competition data
  const enrichedTopBatters = topBatters.map(batter => ({
    ...batter,
    teams: getPlayerTeams(batter.player_id, playerMapping),
    competitions: getPlayerCompetitions(batter.player_id, playerMapping, competitions),
  }));
  
  const enrichedTopBowlers = topBowlers.map(bowler => ({
    ...bowler,
    teams: getPlayerTeams(bowler.player_id, playerMapping),
    competitions: getPlayerCompetitions(bowler.player_id, playerMapping, competitions),
  }));
  
  console.log(`✓ Top batters: ${enrichedTopBatters.length}`);
  console.log(`✓ Top bowlers: ${enrichedTopBowlers.length}`);
  
  return {
    enrichedData,
    battingStats,
    battingReliability,
    bowlingStats,
    bowlingReliability,
    topBatters: enrichedTopBatters,
    topBowlers: enrichedTopBowlers,
    summary: {
      total_players_analyzed: new Set([
        ...battingStats.map(b => b.player_id),
        ...bowlingStats.map(b => b.player_id),
      ]).size,
      eligible_batters: battingReliability.filter(b => b.eligible).length,
      eligible_bowlers: bowlingReliability.filter(b => b.eligible).length,
      total_pressure_balls: enrichedData.filter(b => b.pressure_index >= 60).length,
      total_high_pressure_balls: enrichedData.filter(b => b.pressure_index >= 80).length,
    },
  };
};

// Export rankings to CSV format
export const exportRankingsToCSV = (topBatters, topBowlers) => {
  // Top 10 Batters CSV
  const batterCSV = [
    'Rank,Player Name,Player ID,Teams,Has IPL,Has T20I,Pressure Matches,Pressure Balls,Pressure Runs,Pressure Strike Rate,Normal Strike Rate,SR Difference,Pressure Average,Pressure Dot %,Consistency Score,Reliability Score,Confidence Level',
    ...topBatters.map(b => [
      b.rank,
      `"${b.player_name}"`,
      b.player_id,
      `"${b.teams}"`,
      b.competitions.has_ipl ? 'Yes' : 'No',
      b.competitions.has_t20i ? 'Yes' : 'No',
      b.pressure_matches,
      b.pressure_balls,
      b.pressure_runs,
      b.pressure_strike_rate.toFixed(2),
      b.normal_strike_rate.toFixed(2),
      b.strike_rate_diff.toFixed(2),
      b.pressure_average.toFixed(2),
      b.pressure_dot_pct.toFixed(1),
      b.consistency_component.toFixed(1),
      b.reliability_score.toFixed(1),
      b.confidence_level,
    ].join(','))
  ].join('\n');
  
  // Top 10 Bowlers CSV
  const bowlerCSV = [
    'Rank,Player Name,Player ID,Teams,Has IPL,Has T20I,Pressure Matches,Pressure Overs,Pressure Wickets,Pressure Economy,Normal Economy,Economy Difference,Pressure Average,Pressure Dot %,Consistency Score,Reliability Score,Confidence Level',
    ...topBowlers.map(b => [
      b.rank,
      `"${b.player_name}"`,
      b.player_id,
      `"${b.teams}"`,
      b.competitions.has_ipl ? 'Yes' : 'No',
      b.competitions.has_t20i ? 'Yes' : 'No',
      b.pressure_matches,
      b.pressure_overs.toFixed(1),
      b.pressure_wickets,
      b.pressure_economy.toFixed(2),
      b.normal_economy.toFixed(2),
      b.economy_diff.toFixed(2),
      b.pressure_average === 999 ? 'N/A' : b.pressure_average.toFixed(2),
      b.pressure_dot_pct.toFixed(1),
      b.consistency_component.toFixed(1),
      b.reliability_score.toFixed(1),
      b.confidence_level,
    ].join(','))
  ].join('\n');
  
  return { batterCSV, bowlerCSV };
};

// Save CSV files to downloads
export const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate pressure distribution statistics
export const generatePressureDistribution = (enrichedData) => {
  const distribution = {
    normal: enrichedData.filter(b => b.pressure_category === 'Normal').length,
    moderate: enrichedData.filter(b => b.pressure_category === 'Moderate').length,
    high: enrichedData.filter(b => b.pressure_category === 'High').length,
    extreme: enrichedData.filter(b => b.pressure_category === 'Extreme').length,
  };
  
  const total = enrichedData.length;
  
  return {
    counts: distribution,
    percentages: {
      normal: ((distribution.normal / total) * 100).toFixed(1),
      moderate: ((distribution.moderate / total) * 100).toFixed(1),
      high: ((distribution.high / total) * 100).toFixed(1),
      extreme: ((distribution.extreme / total) * 100).toFixed(1),
    },
  };
};

// Generate match-level pressure statistics
export const generateMatchPressureStats = (enrichedData) => {
  const matchStats = {};
  
  enrichedData.forEach(ball => {
    if (!matchStats[ball.match_id]) {
      matchStats[ball.match_id] = {
        total_balls: 0,
        pressure_balls: 0,
        high_pressure_balls: 0,
      };
    }
    
    matchStats[ball.match_id].total_balls += 1;
    if (ball.pressure_index >= 60) {
      matchStats[ball.match_id].pressure_balls += 1;
    }
    if (ball.pressure_index >= 80) {
      matchStats[ball.match_id].high_pressure_balls += 1;
    }
  });
  
  const matchesWithPressure = Object.values(matchStats).filter(m => m.pressure_balls > 0).length;
  const avgPressureBallsPerMatch = Object.values(matchStats).reduce((sum, m) => sum + m.pressure_balls, 0) / Object.keys(matchStats).length;
  
  return {
    total_matches: Object.keys(matchStats).length,
    matches_with_pressure: matchesWithPressure,
    avg_pressure_balls_per_match: avgPressureBallsPerMatch.toFixed(1),
  };
};

export default {
  generateCompleteAnalysis,
  exportRankingsToCSV,
  downloadCSV,
  generatePressureDistribution,
  generateMatchPressureStats,
};
