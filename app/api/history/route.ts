import { NextRequest, NextResponse } from 'next/server'
import { fetchHistoricalAirQuality } from '@/lib/airQuality'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const county = searchParams.get('county')
    const site = searchParams.get('site')
    const month = searchParams.get('month') // 格式: 2025_12

    // 直接從環境部 API 抓取歷史資料
    let data = await fetchHistoricalAirQuality(month || undefined)

    if (county) {
      data = data.filter(r => r.county === county)
    }
    if (site) {
      data = data.filter(r => r.sitename === site || r.id.startsWith(site))
    }

    // 按時間排序（最新的在前）
    data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ success: true, data, total: data.length })
  } catch (error) {
    console.error('History API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical data', data: [] },
      { status: 200 }
    )
  }
}
