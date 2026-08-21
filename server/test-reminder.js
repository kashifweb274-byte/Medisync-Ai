require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendReminder() {
  try {
    console.log('ℹ️ Active Account SID:', process.env.TWILIO_ACCOUNT_SID);
    console.log(`🚀 Sending WhatsApp from: ${process.env.TWILIO_WHATSAPP_NUMBER} -> to: ${process.env.PATIENT_PHONE_NUMBER}`);

    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.PATIENT_PHONE_NUMBER,
      body: '💊 MediSync Alert: Hello! It is time to take your Paracetamol (500mg) dose.'
    });

    console.log('✅ Success! Message SID:', message.sid);
  } catch (error) {
    console.error('❌ Twilio Error Details:', error);
  }
}

sendReminder();