import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // Fetch the data with a reasonable timeout and size limit
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Wakanda-BI-Engine/1.0'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json({ 
          error: `Failed to fetch data: ${response.status} ${response.statusText}` 
        }, { status: 400 })
      }

      const contentType = response.headers.get('content-type') || ''
      
      // Only process text-based content
      if (!contentType.includes('text') && !contentType.includes('csv') && !contentType.includes('json')) {
        return NextResponse.json({
          error: 'Unsupported content type. Only CSV, JSON, and text files are supported.'
        }, { status: 400 })
      }

      // Read only first 50KB for preview
      const reader = response.body?.getReader()
      if (!reader) {
        return NextResponse.json({ error: 'Could not read response body' }, { status: 400 })
      }

      let text = ''
      let totalBytes = 0
      const maxBytes = 50 * 1024 // 50KB limit for preview

      while (totalBytes < maxBytes) {
        const { done, value } = await reader.read()
        if (done) break
        
        totalBytes += value.length
        text += new TextDecoder().decode(value, { stream: true })
      }

      reader.releaseLock()

      // Parse the data based on content type
      let headers: string[] = []
      let rows: string[][] = []
      let totalRows = 0

      if (contentType.includes('json')) {
        try {
          const jsonData = JSON.parse(text)
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            headers = Object.keys(jsonData[0])
            rows = jsonData.slice(0, 5).map(item => 
              headers.map(header => String(item[header] || ''))
            )
            totalRows = jsonData.length
          }
        } catch (error) {
          return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 })
        }
      } else {
        // Assume CSV format
        const lines = text.split('\n').filter(line => line.trim())
        if (lines.length > 0) {
          headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          rows = lines.slice(1, 6).map(line => 
            line.split(',').map(cell => cell.trim().replace(/"/g, ''))
          )
          totalRows = lines.length - 1
        }
      }

      return NextResponse.json({
        success: true,
        headers,
        rows,
        totalRows,
        contentType,
        previewSize: text.length,
        metadata: {
          columns: headers.length,
          sampleRows: rows.length
        }
      })

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout - data source took too long to respond' }, { status: 408 })
      }
      
      throw error
    }

  } catch (error) {
    console.error('Preview data error:', error)
    return NextResponse.json(
      { error: 'Failed to preview data source' },
      { status: 500 }
    )
  }
}