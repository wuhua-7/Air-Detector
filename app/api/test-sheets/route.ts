import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const SHEET_ID = process.env.GOOGLE_SHEET_ID

    // 列出所有工作表
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    })

    const sheetNames = spreadsheet.data.sheets?.map(s => s.properties?.title) || []

    // 嘗試讀取 AirQuality 工作表
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'AirQuality!A1:I10', // 只讀前10行測試
    })

    return NextResponse.json({
      success: true,
      sheetId: SHEET_ID,
      sheetNames,
      sampleData: response.data.values,
      rowCount: response.data.values?.length || 0,
    })
  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
    })
  }
}
