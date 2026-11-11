const LoadingSpinner = ({ message = 'Loading cricket data...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-xl shadow-lg">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-900 text-lg font-semibold">Pressure Performance Analysis</p>
        <p className="text-gray-600 text-sm max-w-md text-center">{message}</p>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span>Processing ball-by-ball data</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
