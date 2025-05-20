
import emailjs from '@emailjs/browser';

/**
 * EmailJS Service Utility
 * Handles sending email notifications through EmailJS service
 */

// EmailJS configuration
// Note: In a production environment, these should be environment variables
const SERVICE_ID = 'service_email_id'; // Replace with actual EmailJS service ID
const TEMPLATE_ID = 'template_booking_confirmation'; // Replace with actual EmailJS template ID
const USER_ID = 'your_emailjs_user_id'; // Replace with actual EmailJS user ID

// Initialize EmailJS
emailjs.init(USER_ID);

/**
 * Send reservation confirmation email
 * 
 * @param {string} userEmail - Recipient email address
 * @param {string} userName - User's full name
 * @param {object} reservation - Reservation details
 * @returns {Promise} - EmailJS send response
 */
export const sendReservationConfirmation = async (
  userEmail: string,
  userName: string,
  reservation: {
    pitchName: string;
    date: string;
    time: string;
    location?: string;
  }
) => {
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      pitch_name: reservation.pitchName,
      date: reservation.date,
      time: reservation.time,
      location: reservation.location || 'Location not specified'
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams
    );
    
    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

/**
 * Test account for EmailJS notifications
 * Use these credentials for testing the email notification functionality
 */
export const TEST_ACCOUNTS = {
  admin: {
    email: 'osamaabbadi123456@gmail.com',
    firstName: 'Osama',
    lastName: 'Abbadi',
    age: 22,
    city: 'Amman',
    position: 'Forward',
    phone: '07997444269',
    password: 'osamaosama',
    role: 'admin'
  },
  player: {
    email: 'testplayer@example.com',
    firstName: 'Test',
    lastName: 'Player',
    age: 25,
    city: 'Amman',
    position: 'Midfielder',
    phone: '0799123456',
    password: 'testplayer',
    role: 'player'
  }
};

/**
 * Send test email to verify EmailJS configuration
 * 
 * @returns {Promise} - EmailJS send response
 */
export const sendTestEmail = async () => {
  try {
    const templateParams = {
      to_email: TEST_ACCOUNTS.admin.email,
      to_name: `${TEST_ACCOUNTS.admin.firstName} ${TEST_ACCOUNTS.admin.lastName}`,
      message: 'This is a test email to verify EmailJS configuration is working correctly.',
      subject: 'BOKIT Email Notification Test'
    };

    return await emailjs.send(
      SERVICE_ID,
      'template_test', // Use a test template ID
      templateParams
    );
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
};
