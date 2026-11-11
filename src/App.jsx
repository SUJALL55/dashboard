import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './utils/DataContext';
import Header from './components/Header';
import PressureHome from './pages/PressureHome';
import PressureOverview from './pages/PressureOverview';
import TopBatters from './pages/TopBatters';
import TopBowlers from './pages/TopBowlers';
import PlayerComparison from './pages/PlayerComparison';
import Methodology from './pages/Methodology';

function App() {
  return (
    <DataProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<PressureHome />} />
              <Route path="/pressure-overview" element={<PressureOverview />} />
              <Route path="/top-batters" element={<TopBatters />} />
              <Route path="/top-bowlers" element={<TopBowlers />} />
              <Route path="/player-comparison" element={<PlayerComparison />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;
