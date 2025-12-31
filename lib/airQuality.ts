import { AirQualityData, ApiResponse, HistoricalRecord } from './types'

const API_BASE = 'https://data.moenv.gov.tw/api/v2'
const DATASET_ID = 'aqx_p_432'

export async function fetchCurrentAirQuality(): Promise<AirQualityData[]> {
  const apiKey = process.env.MOENV_API_KEY
  if (!apiKey) throw new Error('MOENV_API_KEY is not configured')

  const url = `${API_BASE}/${DATASET_ID}?api_key=${apiKey}&limit=100&format=json`
  
  const response = await fetch(url, { next: { revalidate: 300 } }) // 5分鐘快取
  if (!response.ok) throw new Error('Failed to fetch air quality data')

  const data: ApiResponse = await response.json()
  return data.records || []
}

export function transformToHistoricalRecord(data: AirQualityData): HistoricalRecord {
  return {
    id: `${data.siteid}-${data.publishtime}`,
    sitename: data.sitename,
    county: data.county,
    aqi: parseInt(data.aqi) || 0,
    status: data.status,
    pm25: parseFloat(data['pm2.5']) || 0,
    pm10: parseFloat(data.pm10) || 0,
    o3: parseFloat(data.o3) || 0,
    timestamp: data.publishtime,
  }
}

export function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#00e400'      // 良好 - 綠色
  if (aqi <= 100) return '#ffff00'     // 普通 - 黃色
  if (aqi <= 150) return '#ff7e00'     // 對敏感族群不健康 - 橘色
  if (aqi <= 200) return '#ff0000'     // 對所有族群不健康 - 紅色
  if (aqi <= 300) return '#8f3f97'     // 非常不健康 - 紫色
  return '#7e0023'                      // 危害 - 褐紅色
}

export function getAqiStatus(aqi: number): string {
  if (aqi <= 50) return '良好'
  if (aqi <= 100) return '普通'
  if (aqi <= 150) return '對敏感族群不健康'
  if (aqi <= 200) return '對所有族群不健康'
  if (aqi <= 300) return '非常不健康'
  return '危害'
}
