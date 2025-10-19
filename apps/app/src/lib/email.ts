import { Resend } from 'resend';

// Allow build without API key (will fail at runtime if not set)
const apiKey = process.env.RESEND_API_KEY || 'dummy-key-for-build';

export const resend = new Resend(apiKey);

export interface SendEmailParams {
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

export async function sendEmail(params: SendEmailParams) {
  // Runtime validation
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo || params.from,
      attachments: params.attachments,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
