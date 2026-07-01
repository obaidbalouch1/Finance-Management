import nodemailer from "nodemailer"

const smtpHost = process.env.SMTP_HOST
const smtpPort = process.env.SMTP_PORT
const smtpUser = process.env.SMTP_USER
const smtpPassword = process.env.SMTP_PASSWORD
const emailFrom = process.env.EMAIL_FROM ?? "Finance Manager <no-reply@finance-manager.app>"

const transporter =
  smtpHost && smtpPort && smtpUser && smtpPassword
    ? nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465,
        auth: { user: smtpUser, pass: smtpPassword },
      })
    : null

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
}) {
  if (!transporter) {
    console.info(
      `[email:dev] SMTP is not configured. Would send email to ${options.to}:\n` +
        `Subject: ${options.subject}\n${options.html}`
    )
    return
  }

  await transporter.sendMail({
    from: emailFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
}

export function passwordResetEmailHtml(resetUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>We received a request to reset your Finance Manager password. Click the button below to choose a new one. This link expires in 1 hour.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;">
          Reset password
        </a>
      </p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `
}
