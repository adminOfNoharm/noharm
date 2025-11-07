import { Resend } from 'resend';

// Helper function to get Resend instance
const getResendInstance = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set in environment variables. Please check your .env.local file.');
    console.log('Available environment variables:', Object.keys(process.env).filter(key => key.startsWith('RESEND')));
    return null;
  }

  try {
    return new Resend(apiKey);
  } catch (error) {
    console.warn('Failed to initialize Resend client:', error);
    return null;
  }
};

// Helper function to send email
export const sendEmail = async (to: string, subject: string, html: string) => {
  const resend = getResendInstance();
  
  if (!resend) {
    console.warn('Resend client is not properly initialized. Please ensure RESEND_API_KEY is set in .env.local');
    return null;
  }

  // Use test email in development, production email in production
  // const fromEmail = process.env.NODE_ENV === 'development' 
  //   ? 'onboarding@resend.dev'
  //   : (process.env.RESEND_FROM_EMAIL || 'mirza.ali@noharm.tech');

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'mirza.ali@noharm.tech';


  try {
    console.log('Sending email from:', fromEmail, 'to:', to);
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    // Log specific error cases instead of throwing
    if (error.statusCode === 401) {
      console.error('Invalid Resend API key. Please check your credentials in .env.local');
    } else if (error.statusCode === 403) {
      console.error('Unauthorized access. Please verify your API key permissions.');
    } else if (error.statusCode === 429) {
      console.error('Rate limit exceeded. Please try again later.');
    } else {
      console.error(error.message || 'Failed to send email. Please try again later.');
    }
    
    return null;
  }
};
