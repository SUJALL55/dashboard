import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadAllData, filterRelevantData, validateData } from '../services/csvLoader';
import { generateCompleteAnalysis } from '../services/rankingEngine';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Raw data
  const [ballByBall, setBallByBall] = useState([]);
  const [matches, setMatches] = useState([]);
  const [playingEleven, setPlayingEleven] = useState([]);
  const [playerMapping, setPlayerMapping] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [teams, setTeams] = useState([]);
  
  // Analyzed data
  const [analysis, setAnalysis] = useState(null);
  const [dataStats, setDataStats] = useState(null);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState('Initializing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAndAnalyze = async () => {
      try {
        setLoading(true);
        
        // Step 1: Load all CSV files
        setLoadingProgress('Loading dataset files...');
        const rawData = await loadAllData(setLoadingProgress);
        
        // Step 2: Filter for IPL and T20I from 2022+
        setLoadingProgress('Filtering IPL and T20I data (2022+)...');
        const filteredData = filterRelevantData(rawData);
        
        // Step 3: Validate data quality
        setLoadingProgress('Validating data quality...');
        const validation = validateData(filteredData);
        setDataStats(validation);
        
        // Step 4: Store filtered data in state
        setBallByBall(filteredData.ballByBall);
        setMatches(filteredData.matches);
        setPlayingEleven(filteredData.playingEleven);
        setPlayerMapping(filteredData.playerMapping);
        setCompetitions(filteredData.competitions);
        setTeams(filteredData.teams);
        
        // Step 5: Generate complete pressure analysis
        setLoadingProgress('Calculating pressure indices and reliability scores...');
        const completeAnalysis = generateCompleteAnalysis(filteredData);
        setAnalysis(completeAnalysis);
        
        setLoadingProgress('Analysis complete!');
        console.log('✓ Data loaded and analyzed successfully');
        console.log('Summary:', completeAnalysis.summary);
        
        setLoading(false);
      } catch (err) {
        console.error('Error in data loading/analysis:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadAndAnalyze();
  }, []);

  const value = {
    // Raw data
    ballByBall,
    matches,
    playingEleven,
    playerMapping,
    competitions,
    teams,
    
    // Analysis results
    analysis,
    dataStats,
    
    // State
    loading,
    loadingProgress,
    error,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
