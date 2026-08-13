'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RealTimeChartProps {
  data: any[];
  dataKey: string;
  color: string;
  title: string;
  unit: string;
  domain?: [number, number];
}

export default function RealTimeChart({ data, dataKey, color, title, unit, domain }: RealTimeChartProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              tick={false} 
              type="number" 
              domain={['dataMin', 'dataMax']} 
            />
            <YAxis domain={domain || ['auto', 'auto']} />
            <Tooltip 
              labelFormatter={(label) => new Date(label).toLocaleTimeString()}
              formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, title]}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
