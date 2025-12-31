import { NextResponse } from 'next/server'
import { fetchCurrentAirQuality, transformToHistoricalRecord } from '@/lib/airQuality'
import { saveAirQualityData, initializeSheet } from '@/lib/sheets'

export async function GET() {
  try {
    const data = await fetchCurrentAirQuality()
    return NextResponse.json({ success: true, data, total: data.length })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch air quality data', data: [] },
      { status: 200 }
    )
  }
}

// POST: 儲存當前資料到 Google Sheets
export async function POST() {
  try {
    await initializeSheet()
    const data = await fetchCurrentAirQuality()
    const records = data.map(transformToHistoricalRecord)
    const success = await saveAirQualityData(records)
    
    return NextResponse.json({ 
      success, 
      message: success ? `已儲存 ${records.length} 筆資料到試算表` : '儲存失敗',
      count: records.length
    })
  } catch (error) {
    console.error('Save Error:', error)
    return NextResponse.json(
      { success: false, error: '儲存失敗，請確認 API Key 和試算表設定' },
      { status: 200 }
    )
  }
}
