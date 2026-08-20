import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

/*
|--------------------------------------------------------------------------
| ESCAPE HTML
|--------------------------------------------------------------------------
| Prevent user-controlled values from being interpreted as HTML
| inside notification emails.
|--------------------------------------------------------------------------
*/

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
|--------------------------------------------------------------------------
| SEND VERIFICATION EMAIL
|--------------------------------------------------------------------------
*/

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured."
    );
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const verificationUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const { data, error } =
    await resend.emails.send({
      from:
        "Parenting Blog <onboarding@resend.dev>",

      to: email,

      subject:
        "Verify your email address",

      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h2>Welcome to Parenting Blog 👋</h2>

          <p>Thank you for creating an account.</p>

          <p>
            Please verify your email address by clicking
            the button below.
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
            This verification link will expire for
            security reasons.
          </p>

          <p>
            If you didn't create this account,
            you can safely ignore this email.
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

/*
|--------------------------------------------------------------------------
| SEND PASSWORD RESET EMAIL
|--------------------------------------------------------------------------
*/

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured."
    );
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const resetUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const { data, error } =
    await resend.emails.send({
      from:
        "Parenting Blog <onboarding@resend.dev>",

      to: email,

      subject:
        "Reset your password",

      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h2>Password Reset Request</h2>

          <p>
            We received a request to reset your password.
          </p>

          <p>
            Click the button below to choose a new password.
          </p>

          <p>
            <a
              href="${resetUrl}"
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
              Reset Password
            </a>
          </p>

          <p>
            This link expires in 1 hour.
          </p>

          <p>
            If you didn't request this password reset,
            you can safely ignore this email.
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

/*
|--------------------------------------------------------------------------
| SEND NOTIFICATION EMAIL
|--------------------------------------------------------------------------
| Used for website notifications such as:
|
| - Comments
| - Replies
| - Likes
| - Bookmarks
| - System notifications
|
| The caller must check emailNotifications before
| calling this function.
|--------------------------------------------------------------------------
*/

export async function sendNotificationEmail(
  email: string,
  displayName: string,
  notificationMessage: string,
  notificationLink?: string | null
) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured."
    );
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL.replace(
      /\/$/,
      ""
    );

  const fullNotificationUrl =
    notificationLink
      ? notificationLink.startsWith("http")
        ? notificationLink
        : `${appUrl}${
            notificationLink.startsWith("/")
              ? ""
              : "/"
          }${notificationLink}`
      : appUrl;

  /*
  |--------------------------------------------------------------------------
  | Escape user-controlled values
  |--------------------------------------------------------------------------
  */

  const safeDisplayName =
    escapeHtml(displayName);

  const safeNotificationMessage =
    escapeHtml(notificationMessage);

  const { data, error } =
    await resend.emails.send({
      from:
        "Parenting Blog <onboarding@resend.dev>",

      to: email,

      subject:
        "New notification from Parenting Blog",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            color: #111827;
          "
        >

          <h2
            style="
              margin-bottom: 16px;
              color: #111827;
            "
          >
            You have a new notification 🔔
          </h2>

          <p>
            Hello ${safeDisplayName},
          </p>

          <p>
            ${safeNotificationMessage}
          </p>

          <p style="margin: 24px 0;">
            <a
              href="${fullNotificationUrl}"
              style="
                display: inline-block;
                background: #2563eb;
                color: #ffffff;
                padding: 12px 20px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              "
            >
              View Notification
            </a>
          </p>

          <p
            style="
              color: #6b7280;
              font-size: 13px;
            "
          >
            You are receiving this email because
            email notifications are enabled for your
            Parenting Blog account.
          </p>

          <hr />

          <small
            style="
              color: #6b7280;
            "
          >
            Parenting Blog
          </small>

        </div>
      `,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
