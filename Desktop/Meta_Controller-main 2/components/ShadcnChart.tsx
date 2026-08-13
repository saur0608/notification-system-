'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface ShadcnChartProps {
  data: any[];
  dataKey: string;
  color: string;
  title: string;
  unit: string;
  domain?: [number, number];
}

export default function ShadcnChart({ data, dataKey, color, title, unit, domain }: ShadcnChartProps) {
  const gradientId = `gradient-${dataKey}`;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm w-full bg-white">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold leading-none tracking-tight text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">Real-time {title.toLowerCase()} monitoring</p>
      </div>
      <div className="p-6 pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp" 
                hide 
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                domain={domain || ['auto', 'auto']}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `${value}`}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                        <div className="flex flex-col gap-1">
                          <span className="text-[0.70rem] uppercase text-gray-500 font-semibold">
                            {title}
                          </span>
                          <span className="font-bold text-gray-900 text-lg">
                            {Number(payload[0].value).toFixed(2)} <span className="text-sm font-normal text-gray-500">{unit}</span>
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                animationDuration={1000}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
