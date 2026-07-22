import { Resend } from "resend";


const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;


  await resend.emails.send({
    from: "Parenting Blog <onboarding@resend.dev>",
    to: email,
    subject: "Verify your Parenting Blog account",
    html: `
      <h2>Welcome to Parenting Blog</h2>

      <p>
        Thank you for creating an account.
        Please verify your email address by clicking the link below:
      </p>

      <a href="${verificationUrl}">
        Verify Email
      </a>

      <p>
        If you did not create this account, you can ignore this email.
      </p>
    `,
  });
}
