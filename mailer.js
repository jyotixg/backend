import nodemailer from 'nodemailer';

let transporter;

// Lazily create a reusable transporter backed by a free Ethereal test inbox
async function getTransporter() {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();  // fake dev inbox
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: '"Auth App" <no-reply@authapp.test>',
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log('📧 Email sent! Preview it here:', previewUrl);
  return previewUrl;
}
