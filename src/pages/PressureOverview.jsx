import { useData } from '../utils/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Activity, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { exportPressureOverviewToPDF } from '../utils/pdfExport';

const PressureOverview = () => {
  const { analysis, enrichedData, loading, loadingProgress, error } = useData();

  if (loading) return <LoadingSpinner message={loadingProgress} />;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!analysis) return <div className="p-8 text-center">No analysis available</div>;

  const { summary } = analysis;
  const data = analysis.enrichedData;

  // Pressure distribution
  const pressureDistribution = [
    { name: 'Normal (0-39)', value: data.filter(b => b.pressure_category === 'Normal').length, color: '#10B981' },
    { name: 'Moderate (40-59)', value: data.filter(b => b.pressure_category === 'Moderate').length, color: '#F59E0B' },
    { name: 'High (60-79)', value: data.filter(b => b.pressure_category === 'High').length, color: '#EF4444' },
    { name: 'Extreme (80-100)', value: data.filter(b => b.pressure_category === 'Extreme').length, color: '#7C3AED' },
  ];

  // Innings comparison
  const innings1 = data.filter(b => b.innings === 1);
  const innings2 = data.filter(b => b.innings === 2);
  
  const inningsData = [
    {
      innings: 'Innings 1',
      'Avg Pressure': (innings1.reduce((sum, b) => sum + b.pressure_index, 0) / innings1.length).toFixed(1),
      'High Pressure': innings1.filter(b => b.pressure_index >= 60).length,
    },
    {
      innings: 'Innings 2',
      'Avg Pressure': (innings2.reduce((sum, b) => sum + b.pressure_index, 0) / innings2.length).toFixed(1),
      'High Pressure': innings2.filter(b => b.pressure_index >= 60).length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pressure Analysis Overview</h1>
            <p className="text-gray-600 mt-1">Detailed pressure situation analysis and methodology</p>
          </div>
          <button
            onClick={() => exportPressureOverviewToPDF(data)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Deliveries</p>
                <p className="text-2xl font-bold text-blue-600">{data.length.toLocaleString()}</p>
              </div>
              <Activity className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pressure Deliveries</p>
                <p className="text-2xl font-bold text-orange-600">{summary.total_pressure_balls.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Pressure</p>
                <p className="text-2xl font-bold text-red-600">{summary.total_high_pressure_balls.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pressure %</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((summary.total_pressure_balls / data.length) * 100).toFixed(1)}%
                </p>
              </div>
              <Activity className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pressure Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pressureDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pressureDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Innings Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="innings" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Avg Pressure" fill="#3B82F6" />
                <Bar dataKey="High Pressure" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Pressure Calculation Methodology</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              The pressure index (0-100) is calculated based on match context factors:
            </p>
            
            <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Innings 2 (Chasing):</h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Required Run Rate (40 points max):</strong> Higher required run rate = more pressure</li>
              <li><strong>Wickets Lost (25 points max):</strong> More wickets lost = more pressure</li>
              <li><strong>Balls Remaining (20 points max):</strong> Fewer balls = more pressure</li>
              <li><strong>Match Closeness (15 points max):</strong> Runs needed vs balls remaining</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Innings 1 (Setting Target):</h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Wickets Lost (30 points max):</strong> More wickets lost = more pressure</li>
              <li><strong>Phase (25 points max):</strong> Death overs (16-20) = highest pressure</li>
              <li><strong>Run Rate Gap (20 points max):</strong> Under-scoring vs expected rate</li>
              <li><strong>Resource Pressure (25 points max):</strong> Wickets + balls used combination</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Pressure Categories:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="font-semibold text-green-900">Normal</p>
                <p className="text-sm text-green-700">0-39</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="font-semibold text-yellow-900">Moderate</p>
                <p className="text-sm text-yellow-700">40-59</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="font-semibold text-red-900">High</p>
                <p className="text-sm text-red-700">60-79</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                <p className="font-semibold text-purple-900">Extreme</p>
                <p className="text-sm text-purple-700">80-100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressureOverview;
