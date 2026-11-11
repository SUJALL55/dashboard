const StatCard = ({ title, value, subtitle, icon: Icon, gradient = false }) => {
  return (
    <div
      className={`${
        gradient
          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
          : 'bg-white'
      } rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${gradient ? 'text-purple-100' : 'text-gray-500'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${gradient ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1 ${gradient ? 'text-purple-100' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${gradient ? 'bg-white bg-opacity-20' : 'bg-blue-50'} p-3 rounded-lg`}>
            <Icon className={`w-6 h-6 ${gradient ? 'text-white' : 'text-blue-600'}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
