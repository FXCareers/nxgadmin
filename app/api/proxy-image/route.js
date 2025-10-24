import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  
  if (!imageUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  // Validate the URL to prevent abuse
  try {
    const url = new URL(imageUrl)
    // Only allow specific domains for security
    if (!url.hostname.includes('yagroup.org')) {
      return new NextResponse('Unauthorized domain', { status: 403 })
    }
  } catch (error) {
    return new NextResponse('Invalid URL', { status: 400 })
  }

  try {
    console.log('Proxying image:', imageUrl)
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Image-Proxy/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
        'Cache-Control': 'no-cache'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${response.status} ${response.statusText}`)
      return new NextResponse('Image not found', { status: 404 })
    }

    const contentType = response.headers.get('Content-Type') || 'image/jpeg'
    
    // Validate it's actually an image
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Not an image', { status: 400 })
    }

    const imageBuffer = await response.arrayBuffer()
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 1 day
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    
    if (error.name === 'TimeoutError') {
      return new NextResponse('Request timeout', { status: 408 })
    }
    
    return new NextResponse('Failed to fetch image', { status: 500 })
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 