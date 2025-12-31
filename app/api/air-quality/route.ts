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
      { success: false, error: 'Failed to fetch air quality data' },
      { status: 500 }
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
      message: success ? `Saved ${records.length} records` : 'Failed to save'
    })
  } catch (error) {
    console.error('Save Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save data' },
      { status: 500 }
    )
  }
}
