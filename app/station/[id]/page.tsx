'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AirQualityData, HistoricalRecord } from '@/lib/types'
import { getAqiColor } from '@/lib/airQuality'
import HistoryChart from '@/components/HistoryChart'

export default function StationPage() {
  const params = useParams()
  const router = useRouter()
  const stationId = params.id as string

  const [station, setStation] = useState<AirQualityData | null>(null)
  const [history, setHistory] = useState<HistoricalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // 取得即時資料
        const res = await fetch('/api/air-quality')
        const json = await res.json()
        if (json.success) {
          const found = json.data.find((d: AirQualityData) => d.siteid === stationId)
          setStation(found || null)
        }

        // 取得歷史資料
        const histRes = await fetch(`/api/history?site=${encodeURIComponent(stationId)}`)
        const histJson = await histRes.json()
        if (histJson.success) {
          setHistory(histJson.data)
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchData()
  }, [stationId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">載入中...</div>
  }

  if (!station) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>找不到測站資料</p>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-500 text-white rounded">
          返回首頁
        </button>
      </div>
    )
  }

  const aqi = parseInt(station.aqi) || 0
  const color = getAqiColor(aqi)

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-blue-500 hover:underline"
        >
          ← 返回首頁
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{station.sitename}</h1>
              <p className="text-gray-500">{station.county}</p>
            </div>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl"
              style={{ backgroundColor: color }}
            >
              {aqi}
            </div>
          </div>

          <p className="text-lg mb-4" style={{ color }}>{station.status}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-gray-400">PM2.5</span>
              <span className="text-xl font-bold">{station['pm2.5'] || '-'}</span>
              <span className="text-gray-400 ml-1">μg/m³</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-gray-400">PM10</span>
              <span className="text-xl font-bold">{station.pm10 || '-'}</span>
              <span className="text-gray-400 ml-1">μg/m³</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-gray-400">O₃</span>
              <span className="text-xl font-bold">{station.o3 || '-'}</span>
              <span className="text-gray-400 ml-1">ppb</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-gray-400">CO</span>
              <span className="text-xl font-bold">{station.co || '-'}</span>
              <span className="text-gray-400 ml-1">ppm</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-gray-400">SO₂</span>
              <span className="text-xl font-bold">{station.so2 || '-'}</span>
              <span className="text-gray-400 ml-1">ppb</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-gray-400">NO₂</span>
              <span className="text-xl font-bold">{station.no2 || '-'}</span>
              <span className="text-gray-400 ml-1">ppb</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-gray-400">風速</span>
              <span className="text-xl font-bold">{station.wind_speed || '-'}</span>
              <span className="text-gray-400 ml-1">m/s</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="block text-gray-400">風向</span>
              <span className="text-xl font-bold">{station.wind_direc || '-'}</span>
              <span className="text-gray-400 ml-1">°</span>
            </div>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            更新時間：{station.publishtime}
          </p>
        </div>

        {history.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">歷史趨勢</h2>
            <HistoryChart data={history} selectedSite={station.sitename} />
          </div>
        )}
      </div>
    </main>
  )
}
