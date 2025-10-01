const SibApiV3Sdk = require('sib-api-v3-sdk');
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.brevoEnabled = false;
    this.gmailEnabled = false;
    
    // Try to initialize Brevo
    this.initializeBrevo();
    
    // Initialize Gmail as backup
    this.initializeGmail();
    
    // Show which service is active
    if (this.brevoEnabled && this.gmailEnabled) {
      console.log('📧 Email Service: Brevo (primary) + Gmail (fallback)');
    } else if (this.gmailEnabled) {
      console.log('📧 Email Service: Gmail only');
    } else if (this.brevoEnabled) {
      console.log('📧 Email Service: Brevo only');
    } else {
      console.warn('⚠️ No email service configured!');
    }
  }

  initializeBrevo() {
    try {
      if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
        console.log('ℹ️ Brevo credentials not found, skipping...');
        return;
      }

      const defaultClient = SibApiV3Sdk.ApiClient.instance;
      const apiKey = defaultClient.authentications['api-key'];
      apiKey.apiKey = process.env.BREVO_API_KEY;
      
      this.brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
      this.brevoEnabled = true;
      
      console.log('✅ Brevo initialized');
    } catch (error) {
      console.log('ℹ️ Brevo initialization failed:', error.message);
    }
  }

  initializeGmail() {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('ℹ️ Gmail credentials not found, skipping...');
        return;
      }

      this.gmailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      this.gmailEnabled = true;
      console.log('✅ Gmail SMTP initialized');
    } catch (error) {
      console.log('ℹ️ Gmail initialization failed:', error.message);
    }
  }

  async sendApprovalEmail(submission) {
    console.log(`📤 Sending approval email to: ${submission.email}`);
    
    const emailContent = this.getApprovalEmailContent(submission);
    
    // Try Brevo first
    if (this.brevoEnabled) {
      const brevoResult = await this.sendViaBrevo(submission, emailContent);
      if (brevoResult.success) {
        return brevoResult;
      }
      console.log('⚠️ Brevo failed, trying Gmail fallback...');
    }
    
    // Fallback to Gmail
    if (this.gmailEnabled) {
      return await this.sendViaGmail(submission, emailContent);
    }
    
    return { 
      success: false, 
      error: 'No email service available',
      recipient: submission.email
    };
  }

  async sendRejectionEmail(submission, reason) {
    console.log(`📤 Sending rejection email to: ${submission.email}`);
    
    const emailContent = this.getRejectionEmailContent(submission, reason);
    
    // Try Brevo first
    if (this.brevoEnabled) {
      const brevoResult = await this.sendViaBrevo(submission, emailContent);
      if (brevoResult.success) {
        return brevoResult;
      }
      console.log('⚠️ Brevo failed, trying Gmail fallback...');
    }
    
    // Fallback to Gmail
    if (this.gmailEnabled) {
      return await this.sendViaGmail(submission, emailContent);
    }
    
    return { 
      success: false, 
      error: 'No email service available',
      recipient: submission.email
    };
  }

  async sendViaBrevo(submission, emailContent) {
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      sendSmtpEmail.sender = {
        email: process.env.BREVO_SENDER_EMAIL,
        name: "RCCG HOG Youth"
      };
      
      sendSmtpEmail.to = [
        {
          email: submission.email,
          name: submission.fullName
        }
      ];
      
      sendSmtpEmail.subject = emailContent.subject;
      sendSmtpEmail.htmlContent = emailContent.html;
      sendSmtpEmail.textContent = emailContent.text;
      
      const result = await this.brevoApi.sendTransacEmail(sendSmtpEmail);
      
      console.log('✅ Email sent via Brevo');
      console.log(`   Message ID: ${result.messageId}`);
      
      return { 
        success: true, 
        messageId: result.messageId,
        recipient: submission.email,
        service: 'Brevo'
      };
      
    } catch (error) {
      console.error(`❌ Brevo error: ${error.message}`);
      if (error.response) {
        console.error(`   Details:`, error.response.body);
      }
      return { success: false, error: error.message };
    }
  }

  async sendViaGmail(submission, emailContent) {
    try {
      const info = await this.gmailTransporter.sendMail({
        from: process.env.EMAIL_FROM || `"RCCG HOG Youth" <${process.env.EMAIL_USER}>`,
        to: submission.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });
      
      console.log('✅ Email sent via Gmail');
      console.log(`   Message ID: ${info.messageId}`);
      
      return { 
        success: true, 
        messageId: info.messageId,
        recipient: submission.email,
        service: 'Gmail'
      };
      
    } catch (error) {
      console.error(`❌ Gmail error: ${error.message}`);
      return { 
        success: false, 
        error: error.message,
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