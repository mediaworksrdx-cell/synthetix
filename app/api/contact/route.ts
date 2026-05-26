import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, message } = await request.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, Email, and Message are required fields." },
        { status: 400 }
      );
    }

    // SMTP Configuration from Environment Variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSecure = process.env.SMTP_SECURE === "true"; // true for 465, false for other ports

    // Development Fallback Mode: if SMTP vars are not set, log and simulate success
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn("--- CONTACT FORM SUBMISSION (DEVELOPMENT MODE) ---");
      console.warn(`Name: ${name}`);
      console.warn(`Email: ${email}`);
      console.warn(`Company: ${company || "N/A"}`);
      console.warn(`Message: ${message}`);
      console.warn("SMTP environment variables are not configured. Submission simulated successfully.");
      
      return NextResponse.json(
        { 
          message: "Transmission received successfully (Development Fallback Mode).",
          simulated: true 
        },
        { status: 200 }
      );
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Elegant, Institutional HTML Email Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Synthetix Analytics Inquiry</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background-color: #f8fafc;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            }
            .header {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              color: #ffffff;
              padding: 32px 40px;
              text-align: left;
            }
            .header h1 {
              font-size: 20px;
              font-weight: 700;
              margin: 0;
              letter-spacing: -0.02em;
              text-transform: uppercase;
            }
            .header p {
              font-size: 12px;
              color: #94a3b8;
              margin: 6px 0 0 0;
              font-weight: 600;
              letter-spacing: 0.1em;
              text-transform: uppercase;
            }
            .content {
              padding: 40px;
            }
            .table-container {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            .table-container td {
              padding: 12px 0;
              border-bottom: 1px solid #f1f5f9;
              vertical-align: top;
            }
            .label {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              width: 120px;
            }
            .value {
              font-size: 14px;
              color: #0f172a;
              font-weight: 500;
            }
            .message-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin-top: 24px;
              font-size: 14px;
              line-height: 1.6;
              color: #334155;
              white-space: pre-wrap;
            }
            .footer {
              background: #f8fafc;
              padding: 24px 40px;
              text-align: center;
              border-top: 1px solid #f1f5f9;
              font-size: 11px;
              color: #94a3b8;
              font-weight: 600;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Inquiry Transmission</h1>
              <p>Synthetix Analytics • Contact Portal</p>
            </div>
            <div class="content">
              <table class="table-container">
                <tr>
                  <td class="label">Full Name</td>
                  <td class="value">${name}</td>
                </tr>
                <tr>
                  <td class="label">Email Address</td>
                  <td class="value"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td class="label">Company</td>
                  <td class="value">${company || "Not Specified"}</td>
                </tr>
              </table>
              <div class="label" style="margin-bottom: 8px;">Message Details</div>
              <div class="message-box">${message}</div>
            </div>
            <div class="footer">
              Institutional Grade Engineering • Secured Gateway
            </div>
          </div>
        </body>
      </html>
    `;

    // Email delivery options
    const mailOptions = {
      from: `"Synthetix Contact Portal" <${smtpUser}>`, // SMTP authenticated sender
      to: "care@synthetixanalytics.com", // Recipient
      replyTo: `"${name}" <${email}>`, // Click reply to directly email the customer
      subject: `[INQUIRY] ${name} - ${company || "New Inquiry"}`,
      text: `New Contact Submission:\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || "N/A"}\n\nMessage:\n${message}`,
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Transmission successfully delivered to Synthetix Analytics." },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("SMTP Delivery Error:", errorMessage);
    
    return NextResponse.json(
      { error: "SMTP mail transmission failed. Please try again later." },
      { status: 500 }
    );
  }
}
