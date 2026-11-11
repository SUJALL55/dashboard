/**
 * CSV LOADER SERVICE
 * 
 * Loads and filters cricket data for IPL and T20I matches from 2022 onwards.
 * Performs data validation and preprocessing.
 */

import Papa from 'papaparse';

// IPL Competition IDs (2022-2026)
const IPL_COMP_IDS = [1358, 1715, 2193, 2725, 3298];

// Load a single CSV file
const loadCSV = async (filename) => {
  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    const text = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn(`Parse warnings for ${filename}:`, results.errors);
          }
          resolve(results.data);
        },
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
};

// Load all dataset files
export const loadAllData = async (progressCallback = null) => {
  try {
    if (progressCallback) progressCallback('Loading competitions...');
    const competitions = await loadCSV('competitions.csv');
    
    if (progressCallback) progressCallback('Loading teams...');
    const teams = await loadCSV('teams.csv');
    
    if (progressCallback) progressCallback('Loading player mappings...');
    const playerMapping = await loadCSV('competition_team_player_mapping.csv');
    
    if (progressCallback) progressCallback('Loading matches...');
    const matches = await loadCSV('matches.csv');
    
    if (progressCallback) progressCallback('Loading playing XI...');
    const playingEleven = await loadCSV('playing_eleven.csv');
    
    if (progressCallback) progressCallback('Loading ball-by-ball data (this may take a moment)...');
    const ballByBall = await loadCSV('ball_by_ball.csv');
    
    if (progressCallback) progressCallback('Data loaded successfully!');
    
    return {
      competitions,
      teams,
      playerMapping,
      matches,
      playingEleven,
      ballByBall,
    };
  } catch (error) {
    console.error('Error loading dataset:', error);
    throw error;
  }
};

// Filter for IPL and T20I data from 2022 onwards
export const filterRelevantData = (data) => {
  const { competitions, teams, playerMapping, matches, playingEleven, ballByBall } = data;
  
  // Get all T20I and IPL competition IDs from 2022 onwards
  const relevantCompIds = competitions
    .filter(comp => {
      const season = parseInt(comp.season);
      const isT20Format = comp.match_format === 'T20' || comp.match_format === 'T20I';
      const isFrom2022 = season >= 2022;
      return isT20Format && isFrom2022;
    })
    .map(comp => comp.comp_id);
  
  console.log(`Found ${relevantCompIds.length} relevant competitions (T20/T20I from 2022+)`);
  console.log(`IPL competitions: ${relevantCompIds.filter(id => IPL_COMP_IDS.includes(id)).length}`);
  console.log(`T20I competitions: ${relevantCompIds.filter(id => !IPL_COMP_IDS.includes(id)).length}`);
  
  // Filter matches
  const filteredMatches = matches.filter(match => relevantCompIds.includes(match.comp_id));
  const matchIds = new Set(filteredMatches.map(m => m.match_id));
  
  console.log(`Filtered to ${filteredMatches.length} matches`);
  
  // Filter ball-by-ball data
  const filteredBallByBall = ballByBall.filter(ball => matchIds.has(ball.match_id));
  
  console.log(`Filtered to ${filteredBallByBall.length} deliveries`);
  
  // Filter playing XI
  const filteredPlayingEleven = playingEleven.filter(p => matchIds.has(p.match_id));
  
  // Filter teams
  const filteredTeams = teams.filter(team => relevantCompIds.includes(team.comp_id));
  
  // Filter player mapping
  const filteredPlayerMapping = playerMapping.filter(pm => relevantCompIds.includes(pm.comp_id));
  
  // Filter competitions
  const filteredCompetitions = competitions.filter(comp => relevantCompIds.includes(comp.comp_id));
  
  return {
    competitions: filteredCompetitions,
    teams: filteredTeams,
    playerMapping: filteredPlayerMapping,
    matches: filteredMatches,
    playingEleven: filteredPlayingEleven,
    ballByBall: filteredBallByBall,
    stats: {
      total_competitions: filteredCompetitions.length,
      total_matches: filteredMatches.length,
      total_deliveries: filteredBallByBall.length,
      ipl_matches: filteredMatches.filter(m => IPL_COMP_IDS.includes(m.comp_id)).length,
      t20i_matches: filteredMatches.filter(m => !IPL_COMP_IDS.includes(m.comp_id)).length,
    },
  };
};

// Validate data quality
export const validateData = (data) => {
  const { ballByBall, matches, playerMapping } = data;
  
  const validation = {
    total_balls: ballByBall.length,
    total_matches: matches.length,
    missing_striker_names: ballByBall.filter(b => !b.striker_name).length,
    missing_bowler_names: ballByBall.filter(b => !b.bowler_name).length,
    missing_runs: ballByBall.filter(b => b.runs === null || b.runs === undefined).length,
    total_wickets: ballByBall.filter(b => b.is_wicket).length,
    run_outs: ballByBall.filter(b => b.is_wicket && b.dismissal_type === 'Run Out').length,
    unique_players: new Set([
      ...ballByBall.map(b => b.striker_id),
      ...ballByBall.map(b => b.bowler_id),
    ]).size,
    innings_1_balls: ballByBall.filter(b => b.innings === 1).length,
    innings_2_balls: ballByBall.filter(b => b.innings === 2).length,
  };
  
  console.log('Data Validation:', validation);
  
  return validation;
};

// Get player name from ID
export const getPlayerName = (playerId, playerMapping) => {
  const player = playerMapping.find(p => p.player_id === playerId);
  return player ? player.player_name : `Player ${playerId}`;
};

// Get team name from ID
export const getTeamName = (teamId, teams) => {
  const team = teams.find(t => t.team_id === teamId);
  return team ? team.team_name : `Team ${teamId}`;
};

// Get competition name from ID
export const getCompetitionName = (compId, competitions) => {
  const comp = competitions.find(c => c.comp_id === compId);
  return comp ? comp.comp_name : `Competition ${compId}`;
};

// Export player teams mapping
export const getPlayerTeams = (playerId, playerMapping) => {
  const playerRecords = playerMapping.filter(pm => pm.player_id === playerId);
  const teams = [...new Set(playerRecords.map(pm => pm.team_name))];
  return teams.join(', ');
};

// Export player competitions
export const getPlayerCompetitions = (playerId, playerMapping, competitions) => {
  const playerRecords = playerMapping.filter(pm => pm.player_id === playerId);
  const compIds = [...new Set(playerRecords.map(pm => pm.comp_id))];
  const compNames = compIds.map(id => {
    const comp = competitions.find(c => c.comp_id === id);
    return comp ? comp.comp_name : null;
  }).filter(Boolean);
  
  // Categorize
  const iplComps = compNames.filter(name => name.includes('IPL'));
  const t20iComps = compNames.filter(name => name.includes('T20I'));
  
  return {
    all: compNames,
    ipl: iplComps,
    t20i: t20iComps,
    has_ipl: iplComps.length > 0,
    has_t20i: t20iComps.length > 0,
  };
};

export default {
  loadAllData,
  filterRelevantData,
  validateData,
  getPlayerName,
  getTeamName,
  getCompetitionName,
  getPlayerTeams,
  getPlayerCompetitions,
};
