import { Link, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/pressure-overview', label: 'Pressure Overview' },
    { path: '/top-batters', label: 'Top 10 Batters' },
    { path: '/top-bowlers', label: 'Top 10 Bowlers' },
    { path: '/player-comparison', label: 'Player Comparison' },
    { path: '/methodology', label: 'Methodology' },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Pressure Performance Intelligence</h1>
              <p className="text-xs text-blue-200">IPL & T20I Analysis • 2022-2026</p>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-white text-blue-900'
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
