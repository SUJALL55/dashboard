import { useState, useMemo } from 'react';
import { useData } from '../utils/DataContext';
import { Users, Award, TrendingUp, Download, Search } from 'lucide-react';
import SearchableDropdown from '../components/SearchableDropdown';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PlayerComparison() {
  const { analysis, loading } = useData();
  const [selectedPlayers, setSelectedPlayers] = useState(Array(20).fill(''));

  // Extract batting and bowling data from analysis
  const battingReliability = analysis?.battingReliability || [];
  const bowlingReliability = analysis?.bowlingReliability || [];

  // Get ALL players (batsmen + bowlers) in a single list
  const availablePlayers = useMemo(() => {
    if (!battingReliability.length && !bowlingReliability.length) return [];
    
    const all = new Set([
      ...battingReliability.map(p => p.player_name),
      ...bowlingReliability.map(p => p.player_name),
    ]);
    return [...all].sort();
  }, [battingReliability, bowlingReliability]);

  // Identify all-rounders (players in both batting and bowling lists)
  const allRounders = useMemo(() => {
    if (!battingReliability.length || !bowlingReliability.length) return [];
    
    const batsmen = new Set(battingReliability.map(p => p.player_name));
    const bowlers = new Set(bowlingReliability.map(p => p.player_name));
    return Array.from(batsmen).filter(name => bowlers.has(name));
  }, [battingReliability, bowlingReliability]);

  const handlePlayerChange = (index, playerName) => {
    const newSelected = [...selectedPlayers];
    newSelected[index] = playerName;
    setSelectedPlayers(newSelected);
  };

  // Get unique selected players (non-empty)
  const uniqueSelectedPlayers = useMemo(() => {
    return [...new Set(selectedPlayers.filter(p => p !== ''))];
  }, [selectedPlayers]);

  // Rank selected players by batting reliability (1-10)
  const battingRankings = useMemo(() => {
    if (uniqueSelectedPlayers.length === 0) return [];
    
    const playersWithStats = uniqueSelectedPlayers
      .map(playerName => {
        const stats = battingReliability.find(p => p.player_name === playerName);
        return stats ? { ...stats, player_name: playerName } : null;
      })
      .filter(p => p !== null)
      .sort((a, b) => b.reliability_score - a.reliability_score)
      .slice(0, 10);
    
    return playersWithStats.map((player, index) => ({
      rank: index + 1,
      ...player,
      isAllRounder: allRounders.includes(player.player_name)
    }));
  }, [uniqueSelectedPlayers, battingReliability, allRounders]);

  // Rank selected players by bowling reliability (1-10)
  const bowlingRankings = useMemo(() => {
    if (uniqueSelectedPlayers.length === 0) return [];
    
    const playersWithStats = uniqueSelectedPlayers
      .map(playerName => {
        const stats = bowlingReliability.find(p => p.player_name === playerName);
        return stats ? { ...stats, player_name: playerName } : null;
      })
      .filter(p => p !== null)
      .sort((a, b) => b.reliability_score - a.reliability_score)
      .slice(0, 10);
    
    return playersWithStats.map((player, index) => ({
      rank: index + 1,
      ...player,
      isAllRounder: allRounders.includes(player.player_name)
    }));
  }, [uniqueSelectedPlayers, bowlingReliability, allRounders]);

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Player Comparison Report - Pressure Performance', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
      doc.text(`Selected Players: ${uniqueSelectedPlayers.length}`, pageWidth / 2, 34, { align: 'center' });
      
      // Add pressure note
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Rankings based on Pressure Situations Only (Pressure Index >= 60)', pageWidth / 2, 40, { align: 'center' });
      
      let yPos = 50;
      
      // Batting Rankings
      if (battingRankings.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Top 10 Batsmen Under Pressure', 14, yPos);
        yPos += 8;
        
        const battingTableData = battingRankings.map(p => [
          p.rank,
          p.player_name + (p.isAllRounder ? ' *' : ''),
          p.reliability_score?.toFixed(1) || 'N/A',
          p.pressure_strike_rate?.toFixed(1) || 'N/A',
          p.pressure_average?.toFixed(1) || 'N/A',
          p.pressure_matches || p.matches || 'N/A'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Rank', 'Player', 'P.Reliability', 'P.Strike Rate', 'P.Avg', 'Matches']],
          body: battingTableData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 14, right: 14 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
      // Check if we need a new page
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      // Bowling Rankings
      if (bowlingRankings.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Top 10 Bowlers Under Pressure', 14, yPos);
        yPos += 8;
        
        const bowlingTableData = bowlingRankings.map(p => [
          p.rank,
          p.player_name + (p.isAllRounder ? ' *' : ''),
          p.reliability_score?.toFixed(1) || 'N/A',
          p.pressure_economy?.toFixed(2) || 'N/A',
          p.pressure_wickets || 'N/A',
          p.pressure_matches || p.matches || 'N/A'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Rank', 'Player', 'P.Reliability', 'P.Economy', 'P.Wickets', 'Matches']],
          body: bowlingTableData,
          theme: 'striped',
          headStyles: { fillColor: [34, 197, 94] },
          margin: { left: 14, right: 14 }
        });
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `IPL Pressure Performance Intelligence System - Pressure-Based Rankings - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`player_comparison_pressure_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to export PDF. Please check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Player Comparison & Ranking Under Pressure</h1>
        </div>
        <p className="text-blue-100">
          Select up to 20 players and get auto-ranked top 10 based on PRESSURE PERFORMANCE (Pressure Index ≥ 60)
        </p>
        <p className="text-blue-200 text-sm mt-2">
          Rankings use pressure reliability scores calculated from high-stakes situations only
        </p>
      </div>

      {/* 20 Player Selection Dropdowns */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Select Up to 20 Players
          </h2>
          {uniqueSelectedPlayers.length > 0 && (
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export to PDF
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 20 }, (_, index) => (
            <div key={index}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Player {index + 1}
              </label>
              <SearchableDropdown
                value={selectedPlayers[index]}
                onChange={(playerName) => handlePlayerChange(index, playerName)}
                options={availablePlayers}
                placeholder="-- Select Player --"
                allRounders={allRounders}
              />
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Selected: {uniqueSelectedPlayers.length} unique player{uniqueSelectedPlayers.length !== 1 ? 's' : ''}
          {uniqueSelectedPlayers.length > 0 && ` (⭐ indicates all-rounder)`}
        </p>
      </div>

      {/* Rankings Display */}
      {uniqueSelectedPlayers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Batting Rankings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold">Top 10 Batsmen Under Pressure</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Ranked by Pressure Reliability Score - Performance in high-stakes situations (PI ≥ 60)
            </p>
            {battingRankings.length > 0 ? (
              <div className="space-y-3">
                {battingRankings.map((player) => (
                  <div
                    key={player.player_name}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                      player.rank === 1
                        ? 'border-yellow-400 bg-yellow-50'
                        : player.rank === 2
                        ? 'border-gray-300 bg-gray-50'
                        : player.rank === 3
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      player.rank === 1
                        ? 'bg-yellow-400 text-yellow-900'
                        : player.rank === 2
                        ? 'bg-gray-400 text-gray-900'
                        : player.rank === 3
                        ? 'bg-orange-400 text-orange-900'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {player.rank}
                    </div>
                    <div className="flex-grow">
                      <div className="font-semibold text-gray-900">
                        {player.player_name}
                        {player.isAllRounder && <span className="ml-2 text-purple-600">⭐ All-rounder</span>}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-blue-700">Pressure Reliability: {player.reliability_score.toFixed(1)}</span>
                        <br />
                        Pressure SR: {player.pressure_strike_rate.toFixed(1)} | 
                        Pressure Avg: {player.pressure_average.toFixed(1)} | 
                        Matches: {player.matches}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No batting stats available for selected players
              </p>
            )}
          </div>

          {/* Bowling Rankings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold">Top 10 Bowlers Under Pressure</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Ranked by Pressure Reliability Score - Performance in high-stakes situations (PI ≥ 60)
            </p>
            {bowlingRankings.length > 0 ? (
              <div className="space-y-3">
                {bowlingRankings.map((player) => (
                  <div
                    key={player.player_name}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                      player.rank === 1
                        ? 'border-yellow-400 bg-yellow-50'
                        : player.rank === 2
                        ? 'border-gray-300 bg-gray-50'
                        : player.rank === 3
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      player.rank === 1
                        ? 'bg-yellow-400 text-yellow-900'
                        : player.rank === 2
                        ? 'bg-gray-400 text-gray-900'
                        : player.rank === 3
                        ? 'bg-orange-400 text-orange-900'
                        : 'bg-green-500 text-white'
                    }`}>
                      {player.rank}
                    </div>
                    <div className="flex-grow">
                      <div className="font-semibold text-gray-900">
                        {player.player_name}
                        {player.isAllRounder && <span className="ml-2 text-purple-600">⭐ All-rounder</span>}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-green-700">Pressure Reliability: {player.reliability_score.toFixed(1)}</span>
                        <br />
                        Pressure Econ: {player.pressure_economy.toFixed(2)} | 
                        Wickets: {player.total_wickets} | 
                        Matches: {player.matches}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No bowling stats available for selected players
              </p>
            )}
          </div>
        </div>
      )}

      {uniqueSelectedPlayers.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Select players above to see rankings</p>
          <p className="text-gray-400 text-sm mt-2">
            Select up to 20 players for comparison
          </p>
        </div>
      )}

      {/* Pressure Ranking Explanation */}
      {uniqueSelectedPlayers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-orange-900 mb-2">
                About Pressure-Based Rankings
              </h3>
              <div className="text-sm text-orange-800 space-y-2">
                <p>
                  <strong>These rankings are based ONLY on pressure situations</strong> (Pressure Index ≥ 60), not overall performance.
                </p>
                <p>
                  <strong>Pressure Reliability Score (0-100):</strong> Calculated from player performance when the match situation is high-stakes 
                  (chasing targets, death overs, wickets down, high required run rate).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-white bg-opacity-70 rounded p-3">
                    <p className="font-semibold text-blue-900">Batting Components:</p>
                    <ul className="text-xs mt-1 space-y-1">
                      <li>• Pressure Strike Rate vs Normal SR (40 pts)</li>
                      <li>• Boundary % under pressure (20 pts)</li>
                      <li>• Dismissal avoidance (20 pts)</li>
                      <li>• Consistency across matches (10 pts)</li>
                      <li>• Extreme pressure performance (10 pts)</li>
                    </ul>
                  </div>
                  <div className="bg-white bg-opacity-70 rounded p-3">
                    <p className="font-semibold text-green-900">Bowling Components:</p>
                    <ul className="text-xs mt-1 space-y-1">
                      <li>• Economy rate control (40 pts)</li>
                      <li>• Wicket-taking ability (25 pts)</li>
                      <li>• Dot ball percentage (15 pts)</li>
                      <li>• Boundary prevention (10 pts)</li>
                      <li>• Consistency across matches (10 pts)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
