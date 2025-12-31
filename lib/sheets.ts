import { google } from 'googleapis'
import { HistoricalRecord } from './types'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })
const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SHEET_NAME = 'AirQuality'

export async function getHistoricalData(days: number = 30): Promise<HistoricalRecord[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:I`,
    })

    const rows = response.data.values
    if (!rows || rows.length <= 1) return []

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return rows.slice(1).map((row: string[]) => ({
      id: row[0] || '',
      sitename: row[1] || '',
      county: row[2] || '',
      aqi: parseInt(row[3]) || 0,
      status: row[4] || '',
      pm25: parseFloat(row[5]) || 0,
      pm10: parseFloat(row[6]) || 0,
      o3: parseFloat(row[7]) || 0,
      timestamp: row[8] || '',
    })).filter(record => new Date(record.timestamp) >= cutoffDate)
  } catch (error) {
    console.error('Error reading from Google Sheets:', error)
    return []
  }
}

export async function saveAirQualityData(records: HistoricalRecord[]): Promise<boolean> {
  try {
    const values = records.map((r: HistoricalRecord) => [
      r.id, r.sitename, r.county, r.aqi, r.status, r.pm25, r.pm10, r.o3, r.timestamp
    ])

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    })
    return true
  } catch (error) {
    console.error('Error writing to Google Sheets:', error)
    return false
  }
}

export async function initializeSheet(): Promise<void> {
  try {
    const response = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
    const sheetExists = response.data.sheets?.some((s) => s.properties?.title === SHEET_NAME)

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
        },
      })

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1:I1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['ID', 'SiteName', 'County', 'AQI', 'Status', 'PM2.5', 'PM10', 'O3', 'Timestamp']],
        },
      })
    }
  } catch (error) {
    console.error('Error initializing sheet:', error)
  }
}
