import { supabase } from '@/lib/supabase';

interface StageEmailTemplate {
    subject: string;
    getHtml: (userName?: string) => string;
}

// Map stage IDs to their names
const stageNames: Record<number, string> = {
    1: 'Get to know you',
    2: 'Contract signing',
    3: 'Payment',
    4: 'Solution evaluation',
    5: 'Document submission',
    6: 'Tool preferences',
    // Add more stage names as needed
};

// Single template for all stages
const createStageTemplate = (stageId: number, userName: string = 'there'): StageEmailTemplate => ({
    subject: `NoHarm: ${stageNames[stageId]} Stage Completed`,
    getHtml: () => `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><p>Hi ${userName},</p><p>Congratulations on completing the <strong>${stageNames[stageId]}</strong> stage!</p><p>You're making great progress. The next stage is available in the onboarding dashboard - you can get there by clicking this <a href="https://noharm.tech/onboarding/dashboard" style="color: #10B981; text-decoration: none;">link</a>. Please go ahead and complete it at your convenience.</p><p>If you have any questions along the way, feel free to reach out.</p><p>Kind regards,<br/>The NoHarm Team</p></div>`
});

export const sendStageCompletionEmail = async (stageId: number, userEmail: string, userName?: string): Promise<boolean> => {
    try {
        const stageName = stageNames[stageId];
        if (!stageName) {
            console.warn(`No stage name found for stage ${stageId}`);
            return false;
        }

        // If userName wasn't provided, try to fetch it from seller_compound_data
        if (!userName) {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: userData, error } = await supabase
                        .from('seller_compound_data')
                        .select('name')
                        .eq('uuid', user.id)
                        .single();

                    if (!error && userData?.name) {
                        userName = userData.name;
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch user name:', error);
                // Continue with default "there" if fetch fails
            }
        }

        const template = createStageTemplate(stageId, userName);
        
        // Use try-catch here to handle fetch errors
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: userEmail,
                    subject: template.subject,
                    html: template.getHtml(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Failed to send email:', errorData);
                return false;
            }

            return true;
        } catch (fetchError) {
            console.error('Network error sending email:', fetchError);
            return false;
        }
    } catch (error) {
        console.error('Error sending stage completion email:', error);
        return false;
    }
};

// Welcome email template
export const createWelcomeEmailTemplate = (userName: string = 'there'): StageEmailTemplate => ({
  subject: 'Welcome to NoHarm!',
  getHtml: () => `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><p>Hi ${userName},</p><p>Welcome to NoHarm! We're thrilled to have you join our community of sustainability-minded businesses and individuals.</p><p>Ready to get started?</p><p>The first step is to complete your KYC form. This will help us create your user profile and get you active on our marketplace.</p><p><a href="https://noharm.tech/onboarding/dashboard" style="color: #10B981; text-decoration: none;">https://noharm.tech/onboarding/dashboard</a></p><p>Once your KYC is complete, you're one step closer to exploring NoHarm's marketplace and connecting with our community.</p><p>If you have any questions, please don't hesitate to contact us.</p><p>Welcome aboard!</p><p>The NoHarm Team</p></div>`
});

// Helper function to send welcome email
export const sendWelcomeEmail = async (userEmail: string, userName?: string): Promise<boolean> => {
  try {
    const template = createWelcomeEmailTemplate(userName);
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userEmail,
        subject: template.subject,
        html: template.getHtml(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to send welcome email');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}; 