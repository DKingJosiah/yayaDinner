const brevo = require('@getbrevo/brevo');

class EmailService {
  constructor() {
    // Initialize Brevo API client
    let defaultClient = brevo.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    
    this.apiInstance = new brevo.TransactionalEmailsApi();
  }

  async sendApprovalEmail(submission) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = '🎉 Your Dinner Registration has been Approved!';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Registration Approved!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Dear ${submission.firstName} ${submission.lastName},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Congratulations! Your registration for the exclusive dinner event has been approved.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 10px 0; color: #28a745;">Registration Details:</h3>
            <p style="margin: 5px 0;"><strong>Reference ID:</strong> ${submission.referenceId}</p>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${submission.firstName} ${submission.lastName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${submission.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${submission.phoneNumber}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₦${submission.amount.toLocaleString()}</p>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Please save this email for your records. You'll receive further details about the event soon.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Best regards,<br>
            The Event Team
          </p>
        </div>
      </div>
    `;
    
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Event Team',
      email: process.env.BREVO_SENDER_EMAIL
    };
    
    sendSmtpEmail.to = [{
      email: submission.email,
      name: `${submission.firstName} ${submission.lastName}`
    }];

    try {
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Approval email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending approval email:', error);
      throw new Error(`Failed to send approval email: ${error.message}`);
    }
  }

  async sendRejectionEmail(submission, reason) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = 'Update on Your Dinner Registration';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Registration Update</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="font-size: 16px; color: #333;">Dear ${submission.firstName} ${submission.lastName},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Thank you for your interest in our exclusive dinner event. After reviewing your registration, we need to inform you of the following:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="margin: 0 0 10px 0; color: #dc3545;">Registration Status:</h3>
            <p style="margin: 5px 0;"><strong>Reference ID:</strong> ${submission.referenceId}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Requires Attention</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Please contact us if you have any questions or would like to resubmit your registration with the necessary corrections.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Best regards,<br>
            The Event Team
          </p>
        </div>
      </div>
    `;
    
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Event Team',
      email: process.env.BREVO_SENDER_EMAIL
    };
    
    sendSmtpEmail.to = [{
      email: submission.email,
      name: `${submission.firstName} ${submission.lastName}`
    }];

    try {
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Rejection email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending rejection email:', error);
      throw new Error(`Failed to send rejection email: ${error.message}`);
    }
  }
}

module.exports = new EmailService();