// src/components/RecruitmentPipeline.jsx
import React from 'react';

const RecruitmentPipeline = () => {
  const stages = [
    { name: 'Open Positions', value: 12 },
    { name: 'Interviews', value: 8 },
    { name: 'Shortlisted', value: 5 },
    { name: 'Hired', value: 3 }
  ];

  const maxValue = Math.max(...stages.map(stage => stage.value));

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">{stage.name}</span>
            <span className="text-gray-500">{stage.value}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${(stage.value / maxValue) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecruitmentPipeline;