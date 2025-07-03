import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('=== Simple Test API Called ===')
    const body = await req.json()
    console.log('Request body:', body)
    
    return NextResponse.json({ 
      success: true, 
      message: 'API is working!',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Simple test error:', error)
    return NextResponse.json(
      { error: `Test failed: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Simple GET test working!',
    timestamp: new Date().toISOString()
  })
} 