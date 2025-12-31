import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { HistoricalRecord } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const SHEET_ID = process.env.GOOGLE_SHEET_ID!

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'AirQuality!A:I',
    })

    const rows = response.data.values
    if (!rows || rows.length <= 1) {
      return NextResponse.json({ success: true, data: [], total: 0 })
    }

    // 跳過標題列
    const dataRows = rows.slice(1)

    let data: HistoricalRecord[] = dataRows.map((row: string[]) => ({
      id: row[0] || '',
      sitename: row[1] || '',
      county: row[2] || '',
      aqi: parseInt(row[3]) || 0,
      status: row[4] || '',
      pm25: parseFloat(row[5]) || 0,
      pm10: parseFloat(row[6]) || 0,
      o3: parseFloat(row[7]) || 0,
      timestamp: row[8] || '',
    })).filter(record => record.sitename)

    // 篩選
    const searchParams = request.nextUrl.searchParams
    const county = searchParams.get('county')
    const site = searchParams.get('site')

    if (county) {
      data = data.filter(r => r.county === county)
    }
    if (site) {
      data = data.filter(r => r.sitename === site || r.id.startsWith(site))
    }

    // 按時間排序
    data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ success: true, data, total: data.length })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({
      success: false,
      error: err.message,
      data: []
    })
  }
}
