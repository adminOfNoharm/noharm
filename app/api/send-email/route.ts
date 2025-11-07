import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/utils/resend';

export async function POST(request: Request) {
  try {
    console.log('Request received:', request);
    
    // Log the request body
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
      console.log('Parsed body:', parsedBody);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { to, subject, html } = parsedBody;

    if (!to || !subject || !html) {
      console.log('Missing fields:', { to, subject, html });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendEmail(to, subject, html);
    
    if (!result) {
      console.error('Send email failed with null result');
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', result);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in send-email route:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
