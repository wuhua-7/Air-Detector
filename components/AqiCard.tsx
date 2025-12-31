'use client'

import { AirQualityData } from '@/lib/types'
import { getAqiColor } from '@/lib/airQuality'

interface Props {
  data: AirQualityData
  onClick?: () => void
}

export default function AqiCard({ data, onClick }: Props) {
  const aqi = parseInt(data.aqi) || 0
  const color = getAqiColor(aqi)

  const mapUrl = data.latitude && data.longitude
    ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
    : null

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{data.sitename}</h3>
          <p className="text-gray-500 text-sm">{data.county}</p>
        </div>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: color }}
        >
          {aqi}
        </div>
      </div>
      
      <p className="text-sm mb-3" style={{ color }}>
        {data.status}
      </p>

      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
        <div>
          <span className="block text-gray-400">PM2.5</span>
          <span className="font-medium">{data['pm2.5'] || '-'}</span>
        </div>
        <div>
          <span className="block text-gray-400">PM10</span>
          <span className="font-medium">{data.pm10 || '-'}</span>
        </div>
        <div>
          <span className="block text-gray-400">O₃</span>
          <span className="font-medium">{data.o3 || '-'}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3">
        <p className="text-xs text-gray-400">
          更新: {data.publishtime}
        </p>
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-500 hover:underline"
          >
            📍 地圖
          </a>
        )}
      </div>
    </div>
  )
}
