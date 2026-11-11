// Analytics utility functions for cricket data

export const calculateBattingStats = (ballByBall, playerMapping, playerId = null) => {
  const stats = {};
  
  ballByBall.forEach((ball) => {
    const batsmanId = ball.striker_id;
    if (!batsmanId) return;
    
    if (!stats[batsmanId]) {
      stats[batsmanId] = {
        player_id: batsmanId,
        player_name: ball.striker_name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        innings: 0,
        dismissals: 0,
        dots: 0,
      };
    }
    
    stats[batsmanId].runs += ball.runs || 0;
    stats[batsmanId].balls += 1;
    
    if (ball.is_four) stats[batsmanId].fours += 1;
    if (ball.is_six) stats[batsmanId].sixes += 1;
    if (ball.is_wicket && ball.dismissed_player_id === batsmanId) {
      stats[batsmanId].dismissals += 1;
    }
    if (ball.runs === 0 && !ball.extras_type) {
      stats[batsmanId].dots += 1;
    }
  });

  return Object.values(stats).map((stat) => ({
    ...stat,
    average: stat.dismissals > 0 ? (stat.runs / stat.dismissals).toFixed(2) : stat.runs.toFixed(2),
    strikeRate: stat.balls > 0 ? ((stat.runs / stat.balls) * 100).toFixed(2) : '0.00',
    boundaries: stat.fours + stat.sixes,
    dotBallPercentage: stat.balls > 0 ? ((stat.dots / stat.balls) * 100).toFixed(1) : '0.0',
  }));
};

export const calculateBowlingStats = (ballByBall, playerMapping) => {
  const stats = {};
  
  ballByBall.forEach((ball) => {
    const bowlerId = ball.bowler_id;
    if (!bowlerId) return;
    
    if (!stats[bowlerId]) {
      stats[bowlerId] = {
        player_id: bowlerId,
        player_name: ball.bowler_name,
        wickets: 0,
        runs: 0,
        balls: 0,
        dots: 0,
        fours: 0,
        sixes: 0,
        maidens: 0,
      };
    }
    
    stats[bowlerId].balls += 1;
    stats[bowlerId].runs += ball.runs || 0;
    
    if (ball.is_wicket) stats[bowlerId].wickets += 1;
    if (ball.runs === 0 && !ball.extras_type) stats[bowlerId].dots += 1;
    if (ball.is_four) stats[bowlerId].fours += 1;
    if (ball.is_six) stats[bowlerId].sixes += 1;
  });

  return Object.values(stats).map((stat) => {
    const overs = Math.floor(stat.balls / 6) + (stat.balls % 6) / 10;
    return {
      ...stat,
      overs: overs.toFixed(1),
      economy: overs > 0 ? (stat.runs / overs).toFixed(2) : '0.00',
      average: stat.wickets > 0 ? (stat.runs / stat.wickets).toFixed(2) : '-',
      strikeRate: stat.wickets > 0 ? (stat.balls / stat.wickets).toFixed(1) : '-',
      dotBallPercentage: stat.balls > 0 ? ((stat.dots / stat.balls) * 100).toFixed(1) : '0.0',
    };
  });
};

export const getUncappedPlayers = (playerMapping, competitions) => {
  const iplCompetitions = competitions
    .filter((comp) => comp.comp_name && comp.comp_name.includes('IPL'))
    .map((comp) => comp.comp_id);

  const cappedPlayers = new Set();
  const uncappedPlayers = new Map();

  playerMapping.forEach((mapping) => {
    if (iplCompetitions.includes(mapping.comp_id)) {
      cappedPlayers.add(mapping.player_id);
    } else {
      if (!uncappedPlayers.has(mapping.player_id)) {
        uncappedPlayers.set(mapping.player_id, {
          player_id: mapping.player_id,
          player_name: mapping.player_name,
        });
      }
    }
  });

  // Return only players who are NOT in IPL (uncapped)
  const result = Array.from(uncappedPlayers.values()).filter(
    (player) => !cappedPlayers.has(player.player_id)
  );

  return result;
};

export const getPressureStats = (ballByBall, matches) => {
  const pressureScenarios = ballByBall.filter((ball) => {
    const over = Math.floor(ball.overid);
    // Death overs (16-20)
    const isDeathOver = over >= 16 && over <= 20;
    // Powerplay (1-6)
    const isPowerplay = over >= 1 && over <= 6;
    
    return isDeathOver || isPowerplay;
  });

  return pressureScenarios;
};

export const getTopBatsmen = (battingStats, limit = 10) => {
  return battingStats
    .filter((stat) => stat.balls >= 30) // Minimum qualification
    .sort((a, b) => b.runs - a.runs)
    .slice(0, limit);
};

export const getTopBowlers = (bowlingStats, limit = 10) => {
  return bowlingStats
    .filter((stat) => stat.balls >= 24) // Minimum 4 overs
    .sort((a, b) => b.wickets - a.wickets)
    .slice(0, limit);
};

export const getMatchResults = (matches, teamId = null) => {
  return matches.map((match) => ({
    ...match,
    isHome: match.home_team_id === teamId,
    isWin: match.win_team_id === teamId,
  }));
};

export const getPointsTable = (matches, teams) => {
  const points = {};

  // Get unique IPL teams
  const iplTeams = teams.filter((team) => 
    team.comp_id === 1358 || team.comp_id === 1715 || team.comp_id === 2193 || team.comp_id === 2725 || team.comp_id === 3298
  );

  iplTeams.forEach((team) => {
    if (!points[team.team_id]) {
      points[team.team_id] = {
        team_id: team.team_id,
        team_name: team.team_name,
        matches: 0,
        wins: 0,
        losses: 0,
        nrr: 0,
        points: 0,
      };
    }
  });

  matches
    .filter((match) => [1358, 1715, 2193, 2725, 3298].includes(match.comp_id))
    .forEach((match) => {
      const homeTeam = points[match.home_team_id];
      const awayTeam = points[match.away_team_id];

      if (homeTeam) {
        homeTeam.matches += 1;
        if (match.win_team_id === match.home_team_id) {
          homeTeam.wins += 1;
          homeTeam.points += 2;
        } else if (match.win_team_id) {
          homeTeam.losses += 1;
        }
      }

      if (awayTeam) {
        awayTeam.matches += 1;
        if (match.win_team_id === match.away_team_id) {
          awayTeam.wins += 1;
          awayTeam.points += 2;
        } else if (match.win_team_id) {
          awayTeam.losses += 1;
        }
      }
    });

  return Object.values(points)
    .filter((team) => team.matches > 0)
    .sort((a, b) => b.points - a.points || b.nrr - a.nrr);
};
