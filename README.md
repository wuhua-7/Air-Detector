# 台灣空氣品質監測網站

即時顯示台灣各地空氣品質指標 (AQI)，並可瀏覽過去一個月的歷史記錄。

## 功能

- 即時空氣品質資料顯示
- 依縣市/測站篩選
- 歷史資料圖表與表格
- 資料儲存至 Google 試算表

## 設定步驟

### 1. 取得環境部 API Key

1. 前往 [環境部環境資料開放平臺](https://data.moenv.gov.tw)
2. 註冊帳號
3. 取得 API Key

### 2. 設定 Google Sheets API

1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 建立新專案
3. 啟用 Google Sheets API
4. 建立服務帳戶 (Service Account)
5. 下載 JSON 金鑰檔案
6. 建立一個 Google 試算表
7. 將服務帳戶的 email 加入試算表的共用權限 (編輯者)

### 3. 環境變數

複製 `.env.example` 為 `.env.local`，填入：

```
MOENV_API_KEY=你的環境部API金鑰
GOOGLE_SERVICE_ACCOUNT_EMAIL=服務帳戶email
GOOGLE_PRIVATE_KEY="服務帳戶私鑰"
GOOGLE_SHEET_ID=試算表ID
```

試算表 ID 可從 URL 取得：
`https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

### 4. 本地開發

```bash
npm install
npm run dev
```

### 5. 部署到 Vercel

1. 將專案推送到 GitHub
2. 在 [Vercel](https://vercel.com) 匯入專案
3. 在 Settings > Environment Variables 設定環境變數
4. 部署完成

## 技術架構

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Google Sheets API
- 環境部開放資料 API
