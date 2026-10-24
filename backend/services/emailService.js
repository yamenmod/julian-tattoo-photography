const nodemailer = require("nodemailer");
const axios = require("axios");
const db = require("../db/connection");
const {
  buildOrderEmailHtml,
  formatMoney,
} = require("../utils/emailTemplatesClean");
const {
  splitVatInclusivePricing,
  getVatRateFromDb,
} = require("../utils/pricing");

const normalizePassword = (value) =>
  String(value ?? "")
    .replace(/\s+/g, "")
    .trim();

const createTransporter = () => {
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();
  const pass = normalizePassword(
    process.env.SMTP_PASS || process.env.EMAIL_PASS,
  );

  if (!user || !pass) {
    console.error("[emailService] SMTP credentials are not configured");
    return null;
  }

  return nodemailer.createTransport({
    host: (
      process.env.SMTP_HOST ||
      process.env.EMAIL_HOST ||
      "smtp.gmail.com"
    ).trim(),
    port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587),
    secure:
      Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587) === 465,
    auth: { user, pass },
  });
};

const getFromAddress = () => {
  const from = (
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    ""
  ).trim();
  const name = (process.env.EMAIL_FROM_NAME || "Julian Photography").trim();
  return `${name} <${from}>`;
};

const sendWithGoogleAppsScript = async ({ subject, body }) => {
  const scriptUrl = (process.env.GOOGLE_APPS_SCRIPT_URL || "").trim();
  const scriptSecret = (process.env.GOOGLE_APPS_SCRIPT_SECRET || "").trim();

  if (!scriptUrl || !scriptSecret) {
    return {
      success: false,
      reason: "google-apps-script-not-configured",
      error:
        "GOOGLE_APPS_SCRIPT_URL and GOOGLE_APPS_SCRIPT_SECRET are required for email delivery",
    };
  }

  try {
    const response = await axios.post(
      scriptUrl,
      { secret: scriptSecret, subject, body },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
        validateStatus: () => true,
      },
    );

    if (response.status < 200 || response.status >= 300) {
      return {
        success: false,
        reason: "google-apps-script-delivery-failed",
        error: `Google Apps Script returned HTTP ${response.status}`,
      };
    }

    if (
      response.data?.success === false ||
      response.data?.status === "error"
    ) {
      return {
        success: false,
        reason: "google-apps-script-delivery-failed",
        error: "Google Apps Script rejected the email",
      };
    }

    return { success: true, messageId: "google-apps-script" };
  } catch (error) {
    return {
      success: false,
      reason: "google-apps-script-delivery-failed",
      error: error.message || "Google Apps Script delivery failed",
    };
  }
};

const sendWithResend = async ({ from, to, replyTo, subject, html, text }) => {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const resendFrom = (process.env.EMAIL_FROM || "").trim();

  if (!apiKey || !resendFrom) {
    return {
      success: false,
      reason: "resend-not-configured",
      error: "RESEND_API_KEY and EMAIL_FROM are required for Resend delivery",
    };
  }

  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: resendFrom,
        to: [to],
        reply_to: replyTo,
        subject,
        html,
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    if (!response.data?.id) {
      return {
        success: false,
        reason: "resend-delivery-failed",
        error: "Resend did not return an email id",
      };
    }

    return { success: true, messageId: response.data.id };
  } catch (error) {
    return {
      success: false,
      reason: "resend-delivery-failed",
      error:
        error.response?.data?.message ||
        error.message ||
        "Resend delivery failed",
    };
  }
};

const deliverEmail = async (mailOptions) => {
  const provider = (process.env.EMAIL_PROVIDER || "smtp").trim().toLowerCase();

  if (provider === "resend") {
    return sendWithResend(mailOptions);
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { success: false, reason: "transporter-missing" };
  }

  try {
    await transporter.verify();
  } catch (verifyErr) {
    console.error(
      "[emailService] SMTP verify failed",
      verifyErr.message || verifyErr,
    );
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return {
      success: false,
      reason: "smtp-delivery-failed",
      error: error.message || String(error),
    };
  }
};

const sendOrderConfirmation = async ({
  orderId,
  userId,
  paypalOrderId = null,
}) => {
  if (!orderId || !userId) {
    console.error("[emailService] orderId and userId are required");
    return { success: false, reason: "missing-parameters" };
  }

  try {
    const [orderRows] = await db.query(
      `
        SELECT o.id, o.total, o.status, o.created_at, o.customer_email, u.username, u.email
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.id = ? AND o.user_id = ?
        LIMIT 1
      `,
      [orderId, userId],
    );

    const orderRecord = orderRows[0] || null;
    if (!orderRecord) {
      console.error("[emailService] order not found", { orderId, userId });
      return { success: false, reason: "order-not-found" };
    }

    const customerEmail = (
      orderRecord.customer_email ||
      orderRecord.email ||
      process.env.EMAIL_USER ||
      ""
    ).trim();

    if (!customerEmail) {
      console.error("[emailService] customer email missing for order", {
        orderId,
      });
      return { success: false, reason: "customer-email-missing" };
    }

    const [itemRows] = await db.query(
      `
        SELECT oi.id, oi.quantity, oi.price, oi.name, p.name AS product_name
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC
      `,
      [orderId],
    );

    const items = itemRows.map((row) => ({
      name: row.product_name || row.name,
      quantity: Number(row.quantity) || 1,
      finalPrice: Number(row.price) || 0,
      subtotal: (Number(row.price) || 0) * (Number(row.quantity) || 1),
    }));

    const total = Number(orderRecord.total) || 0;
    const vatRate = await getVatRateFromDb(db);
    const pricing = splitVatInclusivePricing(total, vatRate);

    const html = buildOrderEmailHtml({
      customerName: orderRecord.username || "Surfer",
      orderId: orderRecord.id,
      orderDate: orderRecord.created_at,
      paymentStatus: (orderRecord.status || "").toString(),
      transactionId: paypalOrderId || orderRecord.id,
      currency: process.env.PAYPAL_CURRENCY || "USD",
      items,
      subtotal: pricing.basePrice,
      shipping: 0,
      tax: pricing.vatAmount,
      total,
      viewOrderUrl: "#",
    });

    const mailOptions = {
      from: getFromAddress(),
      to: customerEmail,
      subject: `Order confirmation #${orderRecord.id} | Plage Surf`,
      html,
      text: `Thank you for your order #${orderRecord.id}. Total: ${formatMoney(total)}. Status: ${orderRecord.status}`,
    };

    const result = await deliverEmail(mailOptions);
    if (!result.success) {
      return result;
    }

    console.log("[emailService] order confirmation sent", {
      orderId,
      to: customerEmail,
      messageId: result.messageId,
    });

    return result;
  } catch (err) {
    console.error(
      "[emailService] failed to send order confirmation",
      err.message || err,
    );
    return { success: false, error: err.message || String(err) };
  }
};

const sendContactEmail = async ({ name, email, subject, message }) => {
  if (!name || !email || !subject || !message) {
    console.error(
      "[emailService] name, email, subject, and message are required",
    );
    return { success: false, reason: "missing-parameters" };
  }

  try {
    const result = await sendWithGoogleAppsScript({
      subject: `New Contact Message - ${subject}`,
      body: [
        "New Contact Form Submission",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });
    if (!result.success) {
      return result;
    }

    console.log("[emailService] contact email sent", {
      from: email,
      subject,
      messageId: result.messageId,
    });

    return result;
  } catch (err) {
    console.error(
      "[emailService] failed to send contact email",
      err.message || err,
    );
    return { success: false, error: err.message || String(err) };
  }
};

const sendBookingRequestEmail = async ({
  fullName,
  email,
  preferredDate,
  preferredLocation,
  sessionType,
  bookingType,
  country,
  phone,
  message,
}) => {
  const requestType = (bookingType || sessionType || "Tattoo Booking").trim();

  if (!fullName || !email || !preferredDate || !preferredLocation) {
    console.error("[emailService] booking request data is incomplete");
    return { success: false, reason: "missing-parameters" };
  }

  if (requestType === "Surf Photography" && (!country || !phone)) {
    console.error("[emailService] photography booking details are incomplete");
    return { success: false, reason: "missing-photography-details" };
  }

  try {
    const result = await sendWithGoogleAppsScript({
      subject: `New ${requestType} Request - Julian Photography`,
      body: [
        "New Booking Request",
        "",
        `Booking Type: ${requestType}`,
        `Session Type: ${sessionType || "Not provided"}`,
        `Booking Type Field: ${bookingType || "Not provided"}`,
        `Full Name: ${fullName}`,
        `Email: ${email}`,
        `Phone Number: ${phone || "Not provided"}`,
        `Country: ${country || "Not provided"}`,
        `Preferred Date: ${preferredDate}`,
        `Preferred Location: ${preferredLocation}`,
        "",
        "Additional Message:",
        message || "No additional notes provided.",
      ].join("\n"),
    });
    if (!result.success) {
      return result;
    }

    console.log("[emailService] booking request email sent", {
      from: email,
      bookingType: requestType,
      messageId: result.messageId,
    });

    return result;
  } catch (err) {
    console.error(
      "[emailService] failed to send booking request email",
      err.message || err,
    );
    return { success: false, error: err.message || String(err) };
  }
};

module.exports = {
  sendOrderConfirmation,
  sendContactEmail,
  sendBookingRequestEmail,
};
