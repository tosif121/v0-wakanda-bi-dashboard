import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Detect data source type
    const detectSourceType = (url: string) => {
      if (url.includes('docs.google.com/spreadsheets')) {
        return 'google-sheets'
      }
      if (url.includes('github.com') || url.includes('raw.githubusercontent.com')) {
        return 'github'
      }
      if (url.includes('kaggle.com')) {
        return 'kaggle'
      }
      if (url.match(/\.(csv|json|xlsx|xls)(\?|$)/i)) {
        return 'direct-file'
      }
      return 'web-url'
    }

    // Convert Google Sheets URL to CSV export URL
    const convertGoogleSheetsUrl = (url: string) => {
      if (url.includes('docs.google.com/spreadsheets')) {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
        if (match) {
          const sheetId = match[1]
          return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
        }
      }
      return url
    }

    const sourceType = detectSourceType(url)
    const processUrl = convertGoogleSheetsUrl(url)

    // Test if URL is accessible (optional - you might want to skip this for performance)
    let isAccessible = true
    let contentType = 'unknown'
    let contentLength = 0

    try {
      const response = await fetch(processUrl, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Wakanda-BI-Engine/1.0'
        }
      })
      
      isAccessible = response.ok
      contentType = response.headers.get('content-type') || 'unknown'
      contentLength = parseInt(response.headers.get('content-length') || '0')
    } catch (error) {
      // If HEAD request fails, the URL might still be valid for GET
      console.warn('HEAD request failed, but URL might still be accessible:', error)
    }

    return NextResponse.json({
      success: true,
      originalUrl: url,
      processUrl,
      sourceType,
      isAccessible,
      metadata: {
        contentType,
        contentLength,
        domain: validUrl.hostname
      }
    })
  } catch (error) {
    console.error('URL validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate URL' },
      { status: 500 }
    )
  }
}