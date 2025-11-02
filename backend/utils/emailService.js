const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resendEnabled = false;
    this.resend = null;

    this.initializeResend();

    console.log('📧 Email Service initialized');
    console.log(`   Resend: ${this.resendEnabled ? '✅ Active' : '❌ Disabled'}`);
  }

  initializeResend() {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error('⚠️  RESEND_API_KEY not found in environment variables');
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.resendEnabled = true;
      console.log('✅ Resend initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Resend:', error.message);
      this.resendEnabled = false;
    }
  }

  async sendApprovalEmail(submission) {
    console.log(`📤 Sending approval email to: ${submission.email}`);
    console.log(`   Full name: ${submission.fullName}`);
    console.log(`   Reference ID: ${submission.referenceId}`);
    console.log(`   Resend enabled: ${this.resendEnabled}`);

    if (!this.resendEnabled) {
      return {
        success: false,
        error: 'Resend email service is not initialized',
        recipient: submission.email
      };
    }

    try {
      console.log('🔧 Generating email content...');
      const emailContent = this.getApprovalEmailContent(submission);
      console.log(`   Subject: ${emailContent.subject}`);
      console.log(`   HTML length: ${emailContent.html.length} chars`);

      console.log('📨 Calling sendViaResend...');
      const result = await this.sendViaResend(submission, emailContent);
      console.log('📬 sendViaResend result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in sendApprovalEmail:', error);
      return {
        success: false,
        error: error.message,
        recipient: submission.email
      };
    }
  }

  async sendRejectionEmail(submission, reason) {
    console.log(`📤 Sending rejection email to: ${submission.email}`);
    console.log(`   Resend enabled: ${this.resendEnabled}`);

    if (!this.resendEnabled) {
      return {
        success: false,
        error: 'Resend email service is not initialized',
        recipient: submission.email
      };
    }

    const emailContent = this.getRejectionEmailContent(submission, reason);
    return await this.sendViaResend(submission, emailContent);
  }

  async sendViaResend(submission, emailContent) {
    try {
      const from = process.env.RESEND_FROM_EMAIL || 'notifications@yourdomain.com';
      const replyTo = process.env.RESEND_REPLY_TO || from;

      console.log('📧 Attempting to send via Resend...');
      console.log(`   From: ${from}`);
      console.log(`   To: ${submission.email}`);
      
      const response = await this.resend.emails.send({
        from,
        to: submission.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        reply_to: replyTo,
        headers: { 'X-Reference-ID': submission.referenceId }
      });

      const messageId = response?.data?.id || response?.id;
      console.log('✅ Email sent via Resend');
      console.log(`   Message ID: ${messageId}`);

      return {
        success: true,
        messageId,
        recipient: submission.email,
        service: 'Resend'
      };
    } catch (error) {
      const status = error?.statusCode || error?.response?.status;
      console.error(`❌ Resend error: ${error?.message || String(error)}`);
      if (status) console.error(`   Status: ${status}`);
      if (error?.error) console.error('   Details:', error.error);

      if (status === 403) {
        console.error('   🔒 403 Error - Possible causes:');
        console.error('      1. Domain not verified in Resend');
        console.error('      2. From address not in verified domain');
        console.error('      3. API key lacks permissions or is invalid');
      }
      if (status === 401) {
        console.error('   🔑 401 Unauthorized - Check RESEND_API_KEY');
      }

      return {
        success: false,
        error: error?.message || 'Unknown Resend error',
        recipient: submission.email
      };
    }
  }

  getApprovalEmailContent(submission) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Registration Approved!</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Dear <strong>${submission.fullName}</strong>,
                    </p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      We're thrilled to inform you that your registration for the <strong>RCCG HOG Dinner</strong> has been <span style="color: #22c55e; font-weight: bold;">APPROVED</span>! ✨
                    </p>
                    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #166534; font-size: 14px; font-weight: bold;">YOUR REFERENCE ID</p>
                      <p style="margin: 10px 0 0 0; color: #15803d; font-size: 24px; font-weight: bold; letter-spacing: 1px;">
                        ${submission.referenceId}
                      </p>
                    </div>
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        ⚠️ <strong>Important:</strong> Please keep this reference ID safe. You'll need to present it at the event entrance.
                      </p>
                    </div>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                      We're looking forward to an amazing evening together! 🎊
                    </p>
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                      Best regards,<br>
                      <strong>RCCG HOG Youth Team</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      This is an automated email. Please do not reply to this message.
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                      © ${new Date().getFullYear()} RCCG HOG Youth. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
Registration Approved - RCCG HOG Dinner

Dear ${submission.fullName},

We're thrilled to inform you that your registration for the RCCG HOG Dinner has been APPROVED!

YOUR REFERENCE ID: ${submission.referenceId}

IMPORTANT: Please keep this reference ID safe. You'll need to present it at the event entrance.

We're looking forward to an amazing evening together!

Best regards,
RCCG HOG Youth Team

---
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} RCCG HOG Youth. All rights reserved.
    `;

    return {
      subject: '✅ Registration Approved - RCCG HOG Dinner',
      html,
      text
    };
  }

  getRejectionEmailContent(submission, reason) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Registration Update</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Dear <strong>${submission.fullName}</strong>,
                    </p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Thank you for your interest in the RCCG HOG Dinner. After reviewing your registration, we regret to inform you that it could not be approved at this time.
                    </p>
                    <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px; font-weight: bold;">REFERENCE ID</p>
                      <p style="margin: 0; color: #1f2937; font-size: 20px; font-weight: bold; letter-spacing: 1px;">
                        ${submission.referenceId}
                      </p>
                    </div>
                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: bold;">REASON</p>
                      <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.5;">
                        ${reason}
                      </p>
                    </div>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                      If you believe this is an error or have questions about this decision, please contact us with your reference ID.
                    </p>
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                      Best regards,<br>
                      <strong>RCCG HOG Youth Team</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      This is an automated email. Please do not reply to this message.
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                      © ${new Date().getFullYear()} RCCG HOG Youth. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `
Registration Update - RCCG HOG Dinner

Dear ${submission.fullName},

Thank you for your interest in the RCCG HOG Dinner. After reviewing your registration, we regret to inform you that it could not be approved at this time.

REFERENCE ID: ${submission.referenceId}

REASON: ${reason}

If you believe this is an error or have questions about this decision, please contact us with your reference ID.

Best regards,
RCCG HOG Youth Team

---
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} RCCG HOG Youth. All rights reserved.
    `;

    return {
      subject: 'Registration Update - RCCG HOG Dinner',
      html,
      text
    };
  }
}

module.exports = new EmailService();