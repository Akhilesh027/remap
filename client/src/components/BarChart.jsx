// src/components/BarChart.jsx
import React from 'react';

const BarChart = ({ data }) => {
  // Find max value for scaling
  const maxValue = Math.max(...data.map(item => item.present + item.late));

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center">
          <div className="w-12 text-sm text-gray-600">{item.day}</div>
          <div className="flex-1 flex">
            <div 
              className="bg-green-500 h-6 rounded-l"
              style={{ width: `${(item.present / maxValue) * 100}%` }}
            ></div>
            <div 
              className="bg-yellow-500 h-6 rounded-r"
              style={{ width: `${(item.late / maxValue) * 100}%` }}
            ></div>
          </div>
          <div className="w-16 text-right text-sm text-gray-600">
            {item.present + item.late}
          </div>
        </div>
      ))}
      <div className="flex justify-between mt-4 pt-2 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">Late</span>
        </div>
      </div>
    </div>
  );
};

export default BarChart;