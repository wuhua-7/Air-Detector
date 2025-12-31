'use client'

import { useState, useEffect } from 'react'
import { AirQualityData, HistoricalRecord } from '@/lib/types'
import AqiCard from '@/components/AqiCard'
import HistoryChart from '@/components/HistoryChart'
import HistoryTable from '@/components/HistoryTable'

type Tab = 'realtime' | 'history'

export default function Home() {
  const [tab, setTab] = useState<Tab>('realtime')
  const [currentData, setCurrentData] = useState<AirQualityData[]>([])
  const [historyData, setHistoryData] = useState<HistoricalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCounty, setSelectedCounty] = useState<string>('')
  const [selectedSite, setSelectedSite] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const counties = [...new Set(currentData.map(d => d.county))].sort()
  const sites = selectedCounty
    ? [...new Set(currentData.filter(d => d.county === selectedCounty).map(d => d.sitename))]
    : [...new Set(currentData.map(d => d.sitename))]

  useEffect(() => {
    fetchCurrentData()
  }, [])

  useEffect(() => {
    if (tab === 'history') fetchHistoryData()
  }, [tab, selectedCounty, selectedSite])

  async function fetchCurrentData() {
    setLoading(true)
    try {
      const res = await fetch('/api/air-quality')
      const json = await res.json()
      if (json.success) setCurrentData(json.data)
    } catch (e) {
      console.error('Fetch error:', e)
    }
    setLoading(false)
  }

  async function fetchHistoryData() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ days: '30' })
      if (selectedCounty) params.set('county', selectedCounty)
      if (selectedSite) params.set('site', selectedSite)
      
      const res = await fetch(`/api/history?${params}`)
      const json = await res.json()
      if (json.success) setHistoryData(json.data)
    } catch (e) {
      console.error('Fetch history error:', e)
    }
    setLoading(false)
  }

  async function saveCurrentData() {
    setSaving(true)
    try {
      const res = await fetch('/api/air-quality', { method: 'POST' })
      const json = await res.json()
      alert(json.success ? '資料已儲存!' : '儲存失敗')
    } catch (e) {
      alert('儲存失敗')
    }
    setSaving(false)
  }

  const filteredData = currentData.filter(d => {
    if (selectedCounty && d.county !== selectedCounty) return false
    if (selectedSite && d.sitename !== selectedSite) return false
    return true
  })

  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          🌬️ 台灣空氣品質監測
        </h1>
        <p className="text-gray-500 mt-1">
          資料來源：<a href="https://airtw.moenv.gov.tw/" target="_blank" className="text-blue-500 hover:underline">環境部空氣品質監測網</a>
        </p>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('realtime')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === 'realtime' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            即時資料
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === 'history' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            歷史記錄
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={selectedCounty}
            onChange={(e) => { setSelectedCounty(e.target.value); setSelectedSite('') }}
            className="px-3 py-2 rounded-lg border bg-white"
          >
            <option value="">全部縣市</option>
            {counties.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-white"
          >
            <option value="">全部測站</option>
            {sites.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {tab === 'realtime' && (
            <button
              onClick={saveCurrentData}
              disabled={saving}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? '儲存中...' : '💾 儲存到試算表'}
            </button>
          )}
          <button
            onClick={tab === 'realtime' ? fetchCurrentData : fetchHistoryData}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            🔄 重新整理
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">載入中...</div>
        ) : tab === 'realtime' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredData.map((d, i) => (
              <AqiCard key={d.siteid || i} data={d} onClick={() => setSelectedSite(d.sitename)} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <HistoryChart data={historyData} selectedSite={selectedSite} />
            <HistoryTable data={historyData} />
          </div>
        )}
      </div>

      {/* AQI Legend */}
      <footer className="max-w-6xl mx-auto mt-8 p-4 bg-white rounded-xl">
        <h4 className="font-medium mb-2">AQI 指標說明</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { range: '0-50', label: '良好', color: '#00e400' },
            { range: '51-100', label: '普通', color: '#ffff00' },
            { range: '101-150', label: '對敏感族群不健康', color: '#ff7e00' },
            { range: '151-200', label: '對所有族群不健康', color: '#ff0000' },
            { range: '201-300', label: '非常不健康', color: '#8f3f97' },
            { range: '301+', label: '危害', color: '#7e0023' },
          ].map(item => (
            <span key={item.range} className="flex items-center gap-1">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
              <span>{item.range} {item.label}</span>
            </span>
          ))}
        </div>
      </footer>
    </main>
  )
}
