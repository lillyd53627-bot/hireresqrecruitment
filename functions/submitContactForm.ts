import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const blockedDomains = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
  'live.com', 'icloud.com', 'me.com', 'aol.com', 'mail.com'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { fullName, email, phone, companyName, enquiryReason, message, consent } = await req.json();

    // Validation
    if (!fullName || !email || !phone || !enquiryReason || !consent) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Check business email
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(emailDomain)) {
      return Response.json({ 
        error: 'Please use a business email address. Personal email domains (Gmail, Yahoo, etc.) are not accepted.' 
      }, { status: 400 });
    }

    // Get client IP for security logging
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const timestamp = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });

    // Prepare email body
    const emailBody = `
New Contact Form Enquiry from HireResQ Website

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ENQUIRY DETAILS

Full Name: ${fullName}
Business Email: ${email}
Phone/WhatsApp: ${phone}
Company Name: ${companyName || 'Not provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Enquiry Reason: ${enquiryReason}

${message ? `💬 Message:\n${message}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` : ''}

✅ POPIA Consent: Granted
🕐 Submitted: ${timestamp}
🌐 IP Address: ${clientIP}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTION REQUIRED: Call back ${fullName} at ${phone} within 24 hours.

--
HireResQ AI - Your Automated Hiring Department
    `.trim();

    // Send email to HireResQ team
    await base44.integrations.Core.SendEmail({
      from_name: 'HireResQ Contact Form',
      to: 'info@hireresq.co.za',
      subject: `New Contact Enquiry – ${enquiryReason} from ${fullName}`,
      body: emailBody
    });

    return Response.json({ 
      success: true,
      message: `Thank you! We've received your enquiry. A HireResQ team member will call you back soon at ${phone}.`
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json({ 
      error: 'Failed to submit enquiry. Please try again or call us directly at 010 500 6844.' 
    }, { status: 500 });
  }
});