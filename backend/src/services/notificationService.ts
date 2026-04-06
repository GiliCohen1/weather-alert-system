import nodemailer from "nodemailer";

export class NotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private initPromise: Promise<void> | null = null;

  private async ensureTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    await this.initPromise;
    return this.transporter!;
  }

  async init() {
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log("Test email credentials:", {
      user: testAccount.user,
      pass: testAccount.pass,
      preview: "https://ethereal.email",
    });
  }

  async sendAlertNotification(alert: {
    id: string;
    name?: string;
    parameter: string;
    threshold: number;
    observedValue: number;
  }) {
    try {
      const transporter = await this.ensureTransporter();
      const info = await transporter.sendMail({
        from: '"Weather Alert System" <test@ethereal.email>',
        to: "test@ethereal.email",
        subject: `Weather Alert: ${alert.name || alert.id}`,
        text:
          `Alert triggered!\n\n` +
          `Parameter: ${alert.parameter}\n` +
          `Threshold: ${alert.threshold}\n` +
          `Current value: ${alert.observedValue}\n\n` +
          `Time: ${new Date().toLocaleString()}`,
      });

      console.log(
        "Test email sent! Preview URL:",
        nodemailer.getTestMessageUrl(info),
      );
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string,
  ): Promise<{ resetUrl: string; previewUrl: string | false }> {
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    try {
      const transporter = await this.ensureTransporter();
      const info = await transporter.sendMail({
        from: '"Weather Alert System" <noreply@weatheralert.com>',
        to: email,
        subject: "Password Reset Request",
        text:
          `Hi ${userName},\n\n` +
          `You requested a password reset. Click the link below to reset your password:\n\n` +
          `${resetUrl}\n\n` +
          `This link expires in 1 hour.\n\n` +
          `If you didn't request this, please ignore this email.\n\n` +
          `- Weather Alert System`,
        html:
          `<p>Hi ${userName},</p>` +
          `<p>You requested a password reset. Click the link below to reset your password:</p>` +
          `<p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a></p>` +
          `<p style="color:#666;font-size:13px;">This link expires in 1 hour.</p>` +
          `<p style="color:#666;font-size:13px;">If you didn't request this, please ignore this email.</p>`,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Password reset email sent! Preview URL:", previewUrl);
      return { resetUrl, previewUrl };
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      return { resetUrl, previewUrl: false };
    }
  }
}
