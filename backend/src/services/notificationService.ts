import nodemailer from "nodemailer";

export class NotificationService {
  private transporter!: nodemailer.Transporter;

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
      const info = await this.transporter.sendMail({
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
        nodemailer.getTestMessageUrl(info)
      );
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }
}
