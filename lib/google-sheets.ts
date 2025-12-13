// Google Sheets integration utilities

export interface GoogleSheetsInfo {
  sheetId: string
  sheetName?: string
  csvUrl: string
  originalUrl: string
}

export function parseGoogleSheetsUrl(url: string): GoogleSheetsInfo | null {
  // Match Google Sheets URL patterns
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      const sheetId = match[1]
      
      // Extract sheet name if present (gid parameter)
      const gidMatch = url.match(/[#&]gid=([0-9]+)/)
      const gid = gidMatch ? gidMatch[1] : '0'
      
      return {
        sheetId,
        csvUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
        originalUrl: url
      }
    }
  }

  return null
}

export function createGoogleSheetsPreviewUrl(sheetId: string, gid: string = '0'): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${gid}`
}

export function validateGoogleSheetsAccess(url: string): Promise<boolean> {
  return fetch(url, { method: 'HEAD' })
    .then(response => response.ok)
    .catch(() => false)
}

// Common data source patterns
export const DATA_SOURCE_PATTERNS = {
  googleSheets: /docs\.google\.com\/spreadsheets/,
  githubRaw: /raw\.githubusercontent\.com/,
  github: /github\.com.*\.(csv|json|xlsx)$/,
  kaggle: /kaggle\.com/,
  directCsv: /\.(csv)(\?.*)?$/i,
  directJson: /\.(json)(\?.*)?$/i,
  directExcel: /\.(xlsx|xls)(\?.*)?$/i
}

export function detectDataSourceType(url: string): {
  type: string
  confidence: number
  description: string
} {
  const patterns = [
    {
      pattern: DATA_SOURCE_PATTERNS.googleSheets,
      type: 'google-sheets',
      confidence: 0.95,
      description: 'Google Sheets document'
    },
    {
      pattern: DATA_SOURCE_PATTERNS.githubRaw,
      type: 'github-raw',
      confidence: 0.9,
      description: 'GitHub raw file'
    },
    {
      pattern: DATA_SOURCE_PATTERNS.directCsv,
      type: 'csv-file',
      confidence: 0.85,
      description: 'CSV file'
    },
    {
      pattern: DATA_SOURCE_PATTERNS.directJson,
      type: 'json-file',
      confidence: 0.85,
      description: 'JSON file'
    },
    {
      pattern: DATA_SOURCE_PATTERNS.directExcel,
      type: 'excel-file',
      confidence: 0.8,
      description: 'Excel file'
    },
    {
      pattern: DATA_SOURCE_PATTERNS.kaggle,
      type: 'kaggle',
      confidence: 0.7,
      description: 'Kaggle dataset'
    }
  ]

  for (const { pattern, type, confidence, description } of patterns) {
    if (pattern.test(url)) {
      return { type, confidence, description }
    }
  }

  return {
    type: 'unknown',
    confidence: 0.1,
    description: 'Unknown data source'
  }
}