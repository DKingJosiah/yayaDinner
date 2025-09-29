class EmailService {
  constructor() {
    console.log('EmailService initialized (mock mode)');
  }

  async sendApprovalEmail(submission) {
    try {
      console.log(`Mock: Approval email would be sent to ${submission.email}`);
      console.log(`Reference ID: ${submission.referenceId}`);
      return { success: true, message: 'Mock email sent' };
    } catch (error) {
      console.error('Error in mock approval email:', error);
      throw new Error(`Failed to send approval email: ${error.message}`);
    }
  }

  async sendRejectionEmail(submission, reason) {
    try {
      console.log(`Mock: Rejection email would be sent to ${submission.email}`);
      console.log(`Reference ID: ${submission.referenceId}, Reason: ${reason}`);
      return { success: true, message: 'Mock email sent' };
    } catch (error) {
      console.error('Error in mock rejection email:', error);
      throw new Error(`Failed to send rejection email: ${error.message}`);
    }
  }
}

module.exports = new EmailService();