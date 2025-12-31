import { NextRequest, NextResponse } from 'next/server'
import { getHistoricalData } from '@/lib/sheets'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const county = searchParams.get('county')
    const site = searchParams.get('site')

    // 從試算表讀取歷史資料
    let data = await getHistoricalData(30)

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
