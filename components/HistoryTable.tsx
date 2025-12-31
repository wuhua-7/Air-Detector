'use client'

import { HistoricalRecord } from '@/lib/types'
import { getAqiColor } from '@/lib/airQuality'

interface Props {
  data: HistoricalRecord[]
}

export default function HistoryTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 text-center text-gray-500">
        尚無歷史資料
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">測站</th>
              <th className="px-4 py-3 text-left">縣市</th>
              <th className="px-4 py-3 text-center">AQI</th>
              <th className="px-4 py-3 text-center">PM2.5</th>
              <th className="px-4 py-3 text-center">PM10</th>
              <th className="px-4 py-3 text-center">O₃</th>
              <th className="px-4 py-3 text-left">時間</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.slice(0, 50).map((record, idx) => (
              <tr key={record.id || idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{record.sitename}</td>
                <td className="px-4 py-3 text-gray-600">{record.county}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="inline-block px-2 py-1 rounded text-white text-xs font-bold"
                    style={{ backgroundColor: getAqiColor(record.aqi) }}
                  >
                    {record.aqi}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{record.pm25}</td>
                <td className="px-4 py-3 text-center">{record.pm10}</td>
                <td className="px-4 py-3 text-center">{record.o3}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(record.timestamp).toLocaleString('zh-TW')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
