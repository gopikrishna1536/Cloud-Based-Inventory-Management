import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'red', subtitle }) => {
  const colorMap = {
    red: 'bg-red-50 text-red-600 border-red-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  const badgeClass = colorMap[color] || colorMap.red;

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-200 transition-all duration-300 hover:shadow-md hover:border-red-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${badgeClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        {trend && (
          <span className="text-xs font-bold text-emerald-600 flex items-center">
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
