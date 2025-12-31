import { NextResponse } from 'next/server'
import { fetchCurrentAirQuality, transformToHistoricalRecord } from '@/lib/airQuality'
import { saveAirQualityData, initializeSheet, cleanOldData } from '@/lib/sheets'

// 這個 API 可以被外部 cron service 呼叫來定時同步資料
export async function GET() {
  try {
    await initializeSheet()
    
    // 取得即時資料
    const data = await fetchCurrentAirQuality()
    const records = data.map(transformToHistoricalRecord)
    
    // 儲存到試算表（會自動跳過重複）
    const success = await saveAirQualityData(records)
    
    // 清理超過30天的舊資料
    await cleanOldData()
    
    return NextResponse.json({ 
      success, 
      message: `同步完成`,
      timestamp: new Date().toISOString(),
      recordCount: records.length
    })
  } catch (error) {
    console.error('Sync Error:', error)
    return NextResponse.json(
      { success: false, error: '同步失敗' },
      { status: 200 }
    )
  }
}

// POST 也支援，方便不同呼叫方式
export async function POST() {
  return GET()
}
