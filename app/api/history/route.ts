import { NextRequest, NextResponse } from 'next/server'
import { getHistoricalData } from '@/lib/sheets'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    const county = searchParams.get('county')
    const site = searchParams.get('site')

    let data = await getHistoricalData(days)

    if (county) {
      data = data.filter(r => r.county === county)
    }
    if (site) {
      data = data.filter(r => r.sitename === site || r.id.startsWith(site))
    }

    return NextResponse.json({ success: true, data, total: data.length })
  } catch (error) {
    console.error('History API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical data', data: [] },
      { status: 200 }
    )
  }
}
