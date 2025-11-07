import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/utils/resend';

const ADMIN_EMAIL = 'mirza.ali@noharm.tech';

export async function POST(request: Request) {
  try {
    // Get the email from request body
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send email to admin
    await sendEmail(
      ADMIN_EMAIL,
      'Account Deletion Request',
      `
        <h2>Account Deletion Request</h2>
        <p>A user has requested to delete their account:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Requested at:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>Please process this deletion request within 24 hours.</p>
      `
    );

    // Send confirmation email to user
    await sendEmail(
      email,
      'Account Deletion Request Received',
      `
        <h2>Account Deletion Request Received</h2>
        <p>We have received your request to delete your NoHarm account.</p>
        <p>Your account and all associated data will be permanently deleted within 24 hours.</p>
        <p>You will continue to have access to your account during this time.</p>
        <p>If you did not request this deletion or have changed your mind, 
        please contact our support team immediately.</p>
        <p>Thank you for being part of NoHarm.</p>
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing deletion request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process deletion request' },
      { status: 500 }
    );
  }
} 