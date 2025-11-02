/**
 * Email notification helper using Resend API
 * Sends notifications to info@stephenscode.dev for important events
 */

const NOTIFICATION_EMAIL = "info@stephenscode.dev";
const FROM_EMAIL = "SACVPN Notifications <noreply@stephenscode.dev>";

export interface PurchaseNotification {
  customerEmail: string;
  customerName?: string;
  plan: string;
  billingPeriod: string;
  amount: number;
  currency: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  timestamp: string;
}

export interface SignupNotification {
  userEmail: string;
  userName?: string;
  userId: string;
  timestamp: string;
  signupMethod?: string;
}

/**
 * Send email using Resend API
 */
async function sendEmail(subject: string, html: string): Promise<boolean> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured - email not sent");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [NOTIFICATION_EMAIL],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      return false;
    }

    const data = await response.json();
    console.log("Email sent successfully:", data.id);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Format plan name for display
 */
function formatPlanName(plan: string, billingPeriod: string): string {
  const planNames: Record<string, string> = {
    personal: "Personal",
    gaming: "Gaming",
    business50: "Business 50",
    business100: "Business 100",
    business500: "Business 500",
    business1k: "Business 1K",
    business2500: "Business 2.5K",
    business5k: "Business 5K",
    business10k: "Business 10K",
  };

  const periodNames: Record<string, string> = {
    monthly: "Monthly",
    "6month": "6-Month",
    sixmonth: "6-Month",
    yearly: "Yearly",
    "2year": "2-Year",
    twoyear: "2-Year",
    "3year": "3-Year",
    threeyear: "3-Year",
  };

  const planName = planNames[plan] || plan;
  const periodName = periodNames[billingPeriod] || billingPeriod;

  return `${planName} (${periodName})`;
}

/**
 * Send purchase notification email
 */
export async function sendPurchaseNotification(data: PurchaseNotification): Promise<boolean> {
  const subject = `🎉 New SACVPN Purchase - ${formatPlanName(data.plan, data.billingPeriod)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0; padding: 0; }
    .container { padding: 20px; }
    .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 8px; }
    .detail-row { padding: 12px; margin: 8px 0; background: white; border-left: 4px solid #dc2626; border-radius: 4px; }
    .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .value { font-size: 16px; color: #000; }
    .amount { font-size: 32px; font-weight: bold; color: #16a34a; margin: 20px 0; text-align: center; }
    .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; border-top: 1px solid #ddd; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 28px;">🎉 New Purchase</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">SACVPN Subscription</p>
  </div>

  <div class="container">
    <div class="content">
      <div class="amount">
        ${formatCurrency(data.amount, data.currency)}
      </div>

      <div class="detail-row">
        <span class="label">Plan</span>
        <span class="value">${formatPlanName(data.plan, data.billingPeriod)}</span>
      </div>

      <div class="detail-row">
        <span class="label">Customer Email</span>
        <span class="value">${data.customerEmail}</span>
      </div>

      ${data.customerName ? `
      <div class="detail-row">
        <span class="label">Customer Name</span>
        <span class="value">${data.customerName}</span>
      </div>
      ` : ''}

      <div class="detail-row">
        <span class="label">Stripe Customer ID</span>
        <span class="value"><code>${data.stripeCustomerId}</code></span>
      </div>

      <div class="detail-row">
        <span class="label">Stripe Subscription ID</span>
        <span class="value"><code>${data.stripeSubscriptionId}</code></span>
      </div>

      <div class="detail-row">
        <span class="label">Timestamp</span>
        <span class="value">${new Date(data.timestamp).toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'long'
        })}</span>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://dashboard.stripe.com/customers/${data.stripeCustomerId}" class="button">
          View in Stripe Dashboard
        </a>
      </div>
    </div>

    <div class="footer">
      <p><strong>SACVPN Purchase Notification</strong></p>
      <p>This email was automatically sent when a customer purchased a subscription.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return await sendEmail(subject, html);
}

/**
 * Send signup notification email
 */
export async function sendSignupNotification(data: SignupNotification): Promise<boolean> {
  const subject = `👤 New SACVPN Account Created - ${data.userEmail}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0; padding: 0; }
    .container { padding: 20px; }
    .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; margin: 20px 0; border-radius: 8px; }
    .detail-row { padding: 12px; margin: 8px 0; background: white; border-left: 4px solid #3b82f6; border-radius: 4px; }
    .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .value { font-size: 16px; color: #000; }
    .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; border-top: 1px solid #ddd; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 28px;">👤 New Account</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">SACVPN User Signup</p>
  </div>

  <div class="container">
    <div class="content">
      <div class="detail-row">
        <span class="label">Email</span>
        <span class="value">${data.userEmail}</span>
      </div>

      ${data.userName ? `
      <div class="detail-row">
        <span class="label">Name</span>
        <span class="value">${data.userName}</span>
      </div>
      ` : ''}

      <div class="detail-row">
        <span class="label">User ID</span>
        <span class="value"><code>${data.userId}</code></span>
      </div>

      ${data.signupMethod ? `
      <div class="detail-row">
        <span class="label">Signup Method</span>
        <span class="value">${data.signupMethod}</span>
      </div>
      ` : ''}

      <div class="detail-row">
        <span class="label">Timestamp</span>
        <span class="value">${new Date(data.timestamp).toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'long'
        })}</span>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/auth/users" class="button">
          View in Supabase Dashboard
        </a>
      </div>
    </div>

    <div class="footer">
      <p><strong>SACVPN Signup Notification</strong></p>
      <p>This email was automatically sent when a new user created an account.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return await sendEmail(subject, html);
}
