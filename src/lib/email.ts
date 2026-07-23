import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const verificationUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: "Parenting Blog <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h2>Welcome to Parenting Blog 👋</h2>

        <p>
          Thank you for creating an account.
        </p>

        <p>
          Please verify your email address by clicking the button below.
        </p>

        <p>
          <a
            href="${verificationUrl}"
            style="
              display:inline-block;
              background:#2563eb;
              color:#ffffff;
              padding:12px 20px;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
            "
          >
            Verify Email
          </a>
        </p>

        <p>
          This verification link will expire for security reasons.
        </p>

        <p>
          If you didn't create this account, you can safely ignore this email.
        </p>

        <hr />

        <small>
          Parenting Blog Security Team
        </small>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
    }
