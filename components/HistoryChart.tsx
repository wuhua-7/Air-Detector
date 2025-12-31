'use client'

import { HistoricalRecord } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  data: HistoricalRecord[]
  selectedSite?: string
}

export default function HistoryChart({ data, selectedSite }: Props) {
  const filteredData = selectedSite 
    ? data.filter(d => d.sitename === selectedSite)
    : data

  // 按時間排序並取最近的資料點
  const chartData = filteredData
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-100)
    .map(d => ({
      time: new Date(d.timestamp).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
      AQI: d.aqi,
      'PM2.5': d.pm25,
      PM10: d.pm10,
    }))

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 text-center text-gray-500">
        尚無歷史資料
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h3 className="font-bold mb-4">
        {selectedSite ? `${selectedSite} 歷史趨勢` : '整體歷史趨勢'}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="AQI" stroke="#8884d8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="PM2.5" stroke="#82ca9d" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="PM10" stroke="#ffc658" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
