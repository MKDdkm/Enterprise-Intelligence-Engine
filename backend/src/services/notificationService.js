import nodemailer from "nodemailer";
import { Vonage } from "@vonage/server-sdk";

/**
 * Dispatches emergency notifications (Email & SMS) to the user's trusted contacts.
 * If credentials do not exist in the .env, it defaults to a MOCK implementation
 * so that we do not break the main API upload workflow.
 */
export const triggerEmergencyNotifications = async (record, metadata) => {
  try {
    const { id, gatewayUrl } = record;
    const { description, latitude, longitude } = metadata;
    const googleMapUrl = latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : "No location provided";

    const emergencyMessage = `
🚨 EMERGENCY DISTRESS SIGNAL 🚨

A critical emergency signal has been received by Hershield Guardian!
Location: ${googleMapUrl}
Details: ${description}

Pinata IPFS Gateway for Uploaded Evidence:
${gatewayUrl}

This is an automated priority alert. Please take immediate action.
`;

    const smsPhone = process.env.EMERGENCY_CONTACT_PHONE;
    const vonageApiKey = process.env.VONAGE_API_KEY;
    const vonageApiSecret = process.env.VONAGE_API_SECRET;
    const vonageFromPhone = process.env.VONAGE_FROM_PHONE;

    if (smsPhone && vonageApiKey && vonageApiSecret && vonageFromPhone) {
      console.log(`[SMS Dispatcher]: Connecting to Vonage to send to ${smsPhone}...`);
      const vonage = new Vonage({
        apiKey: vonageApiKey,
        apiSecret: vonageApiSecret
      });
      
      await vonage.sms.send({
        to: smsPhone,
        from: vonageFromPhone,
        text: emergencyMessage.trim()
      });
      console.log(`[SMS Dispatcher]: Emergency SMS successfully sent to ${smsPhone}.`);
    } else {
      console.log(`
------- MOCK SMS DISPATCH -------
[To]: EMERGENCY CONTACT
[Body]: ${emergencyMessage.trim()}
---------------------------------`);
    }

    const emailContact = process.env.EMERGENCY_CONTACT_EMAIL;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (emailContact && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: '"Hershield Guardian" <noreply@hershield.com>',
        to: emailContact,
        subject: "🚨 EMERGENCY DISTRESS SIGNAL: IMMEDIATE ACTION REQUIRED",
        text: emergencyMessage,
      });

      console.log(`[Email Dispatcher]: Emergency Email successfully sent to ${emailContact}.`);
    } else {
      console.log(`
------ MOCK EMAIL DISPATCH ------
[To]: EMERGENCY CONTACT
[Subject]: 🚨 EMERGENCY DISTRESS SIGNAL: IMMEDIATE ACTION REQUIRED

${emergencyMessage.trim()}
---------------------------------`);
    }
  } catch (error) {
    console.error("[Notification Service Error]: Failed to dispatch emergency notifications.", error);
  }
};
