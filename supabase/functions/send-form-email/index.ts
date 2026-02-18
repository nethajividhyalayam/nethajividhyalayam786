import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SCHOOL_EMAIL = "nethajividhyalayam@gmail.com";
const SCHOOL_NAME = "Nethaji Vidhyalayam";
const SCHOOL_ADDRESS = "5/325, Rajiv Nagar, S.Kolathur Main Road, S.Kolathur, Kovilambakkam Post, Chennai - 600129";
const SCHOOL_PHONE = "+91 9841594945 / 6380967675";

interface FieldGroup {
  heading: string;
  fields: { label: string; value: string }[];
}

interface FormEmailRequest {
  formType: "contact" | "admission" | "fee_payment" | "career";
  title: string;
  subtitle?: string;
  fieldGroups: FieldGroup[];
  senderName: string;
  senderEmail?: string;
  resumeUrl?: string;
  receiptDetails?: {
    referenceId: string;
    paymentMethod: string;
    amount?: string;
  };
}

function buildFieldGroupsHTML(fieldGroups: FieldGroup[]): string {
  return fieldGroups
    .map(
      (group) => `
      <div style="margin-bottom:24px;">
        <h3 style="font-size:15px;font-weight:bold;color:#1a3a5c;border-bottom:2px solid #d4a843;padding-bottom:6px;margin:0 0 12px 0;">${group.heading}</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${group.fields
            .map(
              (f) => `
            <tr>
              <td style="padding:8px 12px;font-weight:600;color:#333;width:40%;border-bottom:1px solid #eee;font-size:13px;vertical-align:top;">${f.label}</td>
              <td style="padding:8px 12px;color:#555;border-bottom:1px solid #eee;font-size:13px;">${f.value || "—"}</td>
            </tr>`
            )
            .join("")}
        </table>
      </div>`
    )
    .join("");
}

function buildReceiptHTML(details: FormEmailRequest["receiptDetails"]): string {
  if (!details) return "";
  return `
    <div style="margin-bottom:24px;padding:16px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;">
      <h3 style="font-size:15px;font-weight:bold;color:#166534;margin:0 0 12px 0;">💳 Payment Details</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 12px;font-weight:600;width:40%;font-size:13px;">Reference / Transaction ID</td><td style="padding:6px 12px;font-size:13px;font-weight:bold;">${details.referenceId}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:600;font-size:13px;">Payment Method</td><td style="padding:6px 12px;font-size:13px;">${details.paymentMethod}</td></tr>
        ${details.amount ? `<tr><td style="padding:6px 12px;font-weight:600;font-size:13px;">Amount Paid</td><td style="padding:6px 12px;font-size:13px;font-weight:bold;color:#166534;">₹${details.amount}</td></tr>` : ""}
      </table>
    </div>`;
}

// Generate the printable/downloadable HTML attachment
function buildAttachmentHTML(req: FormEmailRequest, dateStr: string, timeStr: string): string {
  const receiptHTML = req.receiptDetails
    ? `<div style="margin-bottom:20px;padding:12px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;">
        <h3 style="font-size:15px;font-weight:bold;color:#166534;margin-bottom:8px;">Payment Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 10px;font-weight:600;width:40%;font-size:13px;">Reference / Transaction ID</td><td style="padding:4px 10px;font-size:13px;">${req.receiptDetails.referenceId}</td></tr>
          <tr><td style="padding:4px 10px;font-weight:600;font-size:13px;">Payment Method</td><td style="padding:4px 10px;font-size:13px;">${req.receiptDetails.paymentMethod}</td></tr>
          ${req.receiptDetails.amount ? `<tr><td style="padding:4px 10px;font-weight:600;font-size:13px;">Amount Paid</td><td style="padding:4px 10px;font-size:13px;">₹${req.receiptDetails.amount}</td></tr>` : ""}
        </table>
      </div>`
    : "";

  const fieldGroupsHTML = req.fieldGroups
    .map(
      (group) => `
      <div style="margin-bottom:20px;">
        <h3 style="font-size:15px;font-weight:bold;color:#1a3a5c;border-bottom:2px solid #d4a843;padding-bottom:6px;margin-bottom:12px;">${group.heading}</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${group.fields
            .map(
              (f) => `
            <tr>
              <td style="padding:6px 10px;font-weight:600;color:#333;width:40%;border-bottom:1px solid #eee;font-size:13px;">${f.label}</td>
              <td style="padding:6px 10px;color:#555;border-bottom:1px solid #eee;font-size:13px;">${f.value || "—"}</td>
            </tr>`
            )
            .join("")}
        </table>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${req.title} - ${SCHOOL_NAME}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none !important; } }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #fff; color: #333; }
  </style>
</head>
<body>
  <div style="max-width:700px;margin:0 auto;border:2px solid #1a3a5c;border-radius:12px;overflow:hidden;">
    <div style="background:#1a3a5c;color:#fff;padding:20px;text-align:center;">
      <h1 style="margin:0;font-size:22px;letter-spacing:1px;">${SCHOOL_NAME}</h1>
      <p style="margin:4px 0 0;font-size:12px;opacity:0.85;">${SCHOOL_ADDRESS}</p>
      <p style="margin:4px 0 0;font-size:12px;opacity:0.85;">Phone: ${SCHOOL_PHONE} | Email: ${SCHOOL_EMAIL}</p>
    </div>
    <div style="background:#d4a843;padding:10px 20px;text-align:center;">
      <h2 style="margin:0;font-size:17px;color:#1a3a5c;text-transform:uppercase;letter-spacing:1px;">${req.title}</h2>
      ${req.subtitle ? `<p style="margin:4px 0 0;font-size:12px;color:#1a3a5c;">${req.subtitle}</p>` : ""}
    </div>
    <div style="padding:12px 24px;display:flex;justify-content:space-between;font-size:12px;color:#666;border-bottom:1px solid #eee;">
      <span><strong>Date:</strong> ${dateStr}</span>
      <span><strong>Time:</strong> ${timeStr}</span>
    </div>
    <div style="padding:20px 24px;">
      ${receiptHTML}
      ${fieldGroupsHTML}
    </div>
    <div style="background:#f5f5f5;padding:12px 24px;text-align:center;font-size:11px;color:#888;border-top:1px solid #eee;">
      <p style="margin:0;">This is a computer-generated document from ${SCHOOL_NAME}.</p>
      <p style="margin:4px 0 0;">Generated on ${dateStr} at ${timeStr}</p>
    </div>
  </div>
</body>
</html>`;
}

function buildResumeBlock(resumeUrl?: string): string {
  if (!resumeUrl) return "";
  return `
    <div style="margin-bottom:24px;padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
      <h3 style="font-size:15px;font-weight:bold;color:#1e40af;margin:0 0 10px 0;">📎 Resume Attached</h3>
      <p style="font-size:13px;color:#333;margin:0 0 8px;">The applicant has uploaded a resume. Click the button below to download it (link valid for 7 days):</p>
      <a href="${resumeUrl}" target="_blank" style="display:inline-block;background:#1a3a5c;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:bold;">⬇ Download Resume</a>
    </div>`;
}

function buildSchoolEmail(req: FormEmailRequest, dateStr: string, timeStr: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;background:#f4f4f4;">
  <div style="max-width:650px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;border:2px solid #1a3a5c;">
    <div style="background:#1a3a5c;color:#fff;padding:24px;text-align:center;">
      <h1 style="margin:0;font-size:24px;letter-spacing:1px;">📋 ${req.title}</h1>
      ${req.subtitle ? `<p style="margin:6px 0 0;font-size:13px;opacity:0.85;">${req.subtitle}</p>` : ""}
    </div>
    <div style="background:#d4a843;padding:10px 20px;display:flex;justify-content:space-between;font-size:12px;color:#1a3a5c;">
      <span><strong>Date:</strong> ${dateStr}</span>
      <span style="margin-left:auto;"><strong>Time:</strong> ${timeStr}</span>
    </div>
    <div style="padding:24px;">
      <p style="font-size:14px;color:#333;margin:0 0 20px;">New submission received from the website. A printable copy is attached.</p>
      ${buildResumeBlock(req.resumeUrl)}
      ${buildReceiptHTML(req.receiptDetails)}
      ${buildFieldGroupsHTML(req.fieldGroups)}
    </div>
    <div style="background:#f5f5f5;padding:16px 24px;text-align:center;font-size:11px;color:#888;border-top:1px solid #eee;">
      <p style="margin:0;">This is an automated email from ${SCHOOL_NAME} website.</p>
      <p style="margin:4px 0 0;">Received on ${dateStr} at ${timeStr}</p>
    </div>
  </div>
</body></html>`;
}

function getThankYouMessage(formType: string): { heading: string; body: string } {
  switch (formType) {
    case "contact":
      return {
        heading: "Thank You for Contacting Us!",
        body: "We have received your message and our team will get back to you within 24 hours. A copy of your submission is attached for your records.",
      };
    case "admission":
      return {
        heading: "Admission Application Received!",
        body: "Thank you for applying to Nethaji Vidhyalayam. Our admissions team will review it and contact you shortly. A copy of the application is attached for your records.",
      };
    case "fee_payment":
      return {
        heading: "Fee Payment Confirmation",
        body: "Thank you for your fee payment. Please keep the attached receipt for your records. Our accounts team will verify and confirm the payment.",
      };
    case "career":
      return {
        heading: "Application Received — Career Inquiry",
        body: "Thank you for your interest in joining Nethaji Vidhyalayam. Our HR team will review your application and contact you soon. A copy is attached for your records.",
      };
    default:
      return { heading: "Thank You!", body: "We have received your submission. A copy is attached." };
  }
}

function buildParentEmail(req: FormEmailRequest, dateStr: string, timeStr: string): string {
  const thankYou = getThankYouMessage(req.formType);
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;background:#f4f4f4;">
  <div style="max-width:650px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;border:2px solid #1a3a5c;">
    <div style="background:#1a3a5c;color:#fff;padding:24px;text-align:center;">
      <h1 style="margin:0;font-size:22px;letter-spacing:1px;">${SCHOOL_NAME}</h1>
      <p style="margin:6px 0 0;font-size:11px;opacity:0.8;">${SCHOOL_ADDRESS}</p>
      <p style="margin:4px 0 0;font-size:11px;opacity:0.8;">Phone: ${SCHOOL_PHONE} | Email: ${SCHOOL_EMAIL}</p>
    </div>
    <div style="background:#d4a843;padding:10px 20px;text-align:center;">
      <h2 style="margin:0;font-size:16px;color:#1a3a5c;text-transform:uppercase;letter-spacing:1px;">${req.title}</h2>
    </div>
    <div style="padding:24px;">
      <p style="font-size:16px;font-weight:bold;color:#1a3a5c;margin:0 0 8px;">Dear ${req.senderName},</p>
      <h2 style="font-size:18px;color:#1a3a5c;margin:0 0 8px;">${thankYou.heading}</h2>
      <p style="font-size:13px;color:#555;line-height:1.6;margin:0 0 20px;">${thankYou.body}</p>
      
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;border:1px solid #e9ecef;">
        <h3 style="font-size:14px;color:#1a3a5c;margin:0 0 4px;">📄 Your Submission Summary</h3>
        <p style="font-size:11px;color:#888;margin:0 0 16px;">Date: ${dateStr} | Time: ${timeStr}</p>
        ${buildReceiptHTML(req.receiptDetails)}
        ${buildFieldGroupsHTML(req.fieldGroups)}
      </div>
      
      <div style="margin-top:24px;padding:16px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
        <p style="font-size:13px;color:#1e40af;margin:0;"><strong>📞 Need Help?</strong></p>
        <p style="font-size:12px;color:#1e40af;margin:4px 0 0;">Call us at ${SCHOOL_PHONE} or email ${SCHOOL_EMAIL}</p>
      </div>
    </div>
    <div style="background:#1a3a5c;color:#fff;padding:16px 24px;text-align:center;font-size:11px;">
      <p style="margin:0;opacity:0.9;">${SCHOOL_NAME}</p>
      <p style="margin:4px 0 0;opacity:0.7;">${SCHOOL_ADDRESS}</p>
      <p style="margin:4px 0 0;opacity:0.6;">This is a computer-generated email. Please do not reply directly.</p>
    </div>
  </div>
</body></html>`;
}

function getSubjectLine(req: FormEmailRequest): string {
  switch (req.formType) {
    case "contact": return `Contact Enquiry: ${req.subtitle || "New Message"}`;
    case "admission": return `Admission Application: ${req.subtitle || "New Application"}`;
    case "fee_payment": return `Fee Payment: ${req.subtitle || "Payment Recorded"}`;
    case "career": return `Career Application: ${req.subtitle || "New Application"}`;
    default: return req.title;
  }
}

function getParentSubject(req: FormEmailRequest): string {
  switch (req.formType) {
    case "contact": return `Thank you for contacting ${SCHOOL_NAME}`;
    case "admission": return `Admission Application Received — ${SCHOOL_NAME}`;
    case "fee_payment": return `Fee Payment Receipt — ${SCHOOL_NAME}`;
    case "career": return `Career Application Received — ${SCHOOL_NAME}`;
    default: return `Confirmation from ${SCHOOL_NAME}`;
  }
}

function getAttachmentFilename(req: FormEmailRequest): string {
  const safeName = req.senderName.replace(/[^a-zA-Z0-9]/g, "_");
  switch (req.formType) {
    case "contact": return `Contact_Enquiry_${safeName}.html`;
    case "admission": return `Admission_Application_${safeName}.html`;
    case "fee_payment": return `Fee_Payment_Receipt_${safeName}.html`;
    case "career": return `Career_Application_${safeName}.html`;
    default: return `${req.title.replace(/\s+/g, "_")}_${safeName}.html`;
  }
}

// Encode string to base64
function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: FormEmailRequest = await req.json();
    const { formType, senderName, senderEmail, fieldGroups, title } = body;

    if (!formType || !senderName || !fieldGroups || !title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // Generate the printable HTML attachment
    const attachmentHTML = buildAttachmentHTML(body, dateStr, timeStr);
    const attachmentFilename = getAttachmentFilename(body);
    const attachmentBase64 = toBase64(attachmentHTML);

    const attachment = {
      filename: attachmentFilename,
      content: attachmentBase64,
      content_type: "text/html",
    };

    const subject = getSubjectLine(body);
    const schoolHTML = buildSchoolEmail(body, dateStr, timeStr);

    // Send to school with attachment
    const schoolResult = await resend.emails.send({
      from: `${SCHOOL_NAME} Website <onboarding@resend.dev>`,
      to: [SCHOOL_EMAIL],
      subject,
      html: schoolHTML,
      reply_to: senderEmail || undefined,
      attachments: [attachment],
    });
    console.log("School email sent:", schoolResult);

    // Send thank-you copy to parent/enquirer with attachment
    if (senderEmail && senderEmail.includes("@")) {
      const parentHTML = buildParentEmail(body, dateStr, timeStr);
      const parentSubject = getParentSubject(body);

      const parentResult = await resend.emails.send({
        from: `${SCHOOL_NAME} <onboarding@resend.dev>`,
        to: [senderEmail],
        subject: parentSubject,
        html: parentHTML,
        attachments: [attachment],
      });
      console.log("Parent copy sent:", parentResult);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending form email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
