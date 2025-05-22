
import { toast } from "@/hooks/use-toast";
import emailjs from 'emailjs-com';

/**
 * Email notification service using EmailJS
 * Provides functions for sending various types of email notifications
 */

// EmailJS configuration
const EMAIL_SERVICE_ID = "service_id"; // Replace with your EmailJS service ID
const EMAIL_USER_ID = "user_id";       // Replace with your EmailJS user ID
const EMAIL_TEMPLATE_ID = {
  GAME_CANCELLATION: "template_cancel",
  WAITING_LIST: "template_waitlist",
  PLAYER_SUSPENSION: "template_suspension"
};

// Initialize EmailJS
emailjs.init(EMAIL_USER_ID);

// Define email template interfaces
interface EmailTemplate {
  subject: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
}

/**
 * Send email notification via EmailJS
 * @param {string} to - Recipient email address
 * @param {EmailTemplate} template - Email template with subject and body
 * @returns {Promise<boolean>} - Success status of the email send operation
 */
export const sendEmail = async (to: string, template: EmailTemplate): Promise<boolean> => {
  try {
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${template.subject}`);
    
    // For demonstration, we're returning true
    // In production, this would use EmailJS to send actual emails
    
    // Example EmailJS implementation:
    // const response = await emailjs.send(
    //   EMAIL_SERVICE_ID,
    //   EMAIL_TEMPLATE_ID.GAME_CANCELLATION, // Choose appropriate template
    //   {
    //     to_email: to,
    //     subject: template.subject,
    //     message: template.body,
    //     button_text: template.buttonText || "",
    //     button_url: template.buttonUrl || "",
    //   }
    // );
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    toast({
      title: "Email Notification Failed",
      description: "Failed to send email notification. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Send game cancellation notification to all players
 * @param {object} gameDetails - Details about the cancelled game
 * @param {string[]} playerEmails - Array of player email addresses
 */
export const sendGameCancellationNotification = async (
  gameDetails: { title: string; date: string; time: string; location: string },
  playerEmails: string[]
): Promise<void> => {
  try {
    // For each player email, send a cancellation notification
    for (const email of playerEmails) {
      // In a real implementation, this would use EmailJS directly:
      // await emailjs.send(
      //   EMAIL_SERVICE_ID,
      //   EMAIL_TEMPLATE_ID.GAME_CANCELLATION,
      //   {
      //     to_email: email,
      //     game_title: gameDetails.title,
      //     game_date: gameDetails.date,
      //     game_time: gameDetails.time,
      //     game_location: gameDetails.location
      //   }
      // );
      
      // For demo, using template approach
      const template: EmailTemplate = {
        subject: `⚠️ Game Cancelled: ${gameDetails.title}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 5px;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
              <h1 style="color: #0F766E; margin: 0; padding: 0;">Game Cancelled</h1>
            </div>
            
            <div style="padding: 20px 0;">
              <p style="margin-bottom: 15px;">Dear Player,</p>
              <p style="margin-bottom: 15px;">We regret to inform you that the following game has been cancelled:</p>
              
              <div style="background-color: #f7fafc; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Game:</strong> ${gameDetails.title}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${gameDetails.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${gameDetails.time}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${gameDetails.location}</p>
              </div>
              
              <p style="margin-bottom: 15px;">We apologize for any inconvenience this may cause. Please check our app for other available games.</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="#" style="display: inline-block; background-color: #0F766E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Other Games</a>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; color: #718096; font-size: 12px;">
              <p>© 2025 Football Reservations App. All rights reserved.</p>
            </div>
          </div>
        `,
      };
      
      await sendEmail(email, template);
    }
    
    toast({
      title: "Notifications Sent",
      description: `Game cancellation notifications sent to ${playerEmails.length} players.`,
    });
  } catch (error) {
    console.error("Error sending cancellation notifications:", error);
    toast({
      title: "Notification Error",
      description: "Failed to send some cancellation notifications.",
      variant: "destructive",
    });
  }
};

/**
 * Send notification to waiting list players
 * @param {object} gameDetails - Details about the game
 * @param {string[]} waitingListEmails - Array of waiting list player email addresses
 * @param {string} joinUrl - URL for players to follow to join the game
 */
export const sendWaitingListNotification = async (
  gameDetails: { id: number; title: string; date: string; time: string; location: string },
  waitingListEmails: string[],
  joinUrl: string
): Promise<void> => {
  try {
    // Limit to the top 3 players on the waiting list
    const limitedWaitingList = waitingListEmails.slice(0, 3);
    
    // Notify each player on the waiting list (limited to top 3)
    for (const email of limitedWaitingList) {
      // In a real implementation, this would use EmailJS directly
      
      // For demo, using template approach
      const template: EmailTemplate = {
        subject: `🏆 Spot Available: ${gameDetails.title}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 5px;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
              <h1 style="color: #0F766E; margin: 0; padding: 0;">Spot Available!</h1>
            </div>
            
            <div style="padding: 20px 0;">
              <p style="margin-bottom: 15px;">Great news! A spot has opened up in the following game:</p>
              
              <div style="background-color: #f7fafc; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Game:</strong> ${gameDetails.title}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${gameDetails.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${gameDetails.time}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${gameDetails.location}</p>
              </div>
              
              <p style="margin-bottom: 15px;">The spot is available on a first-come, first-served basis. Click the button below to join now!</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="${joinUrl}" style="display: inline-block; background-color: #0F766E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Game</a>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; color: #718096; font-size: 12px;">
              <p>© 2025 Football Reservations App. All rights reserved.</p>
            </div>
          </div>
        `,
        buttonText: "Join Game",
        buttonUrl: joinUrl,
      };
      
      await sendEmail(email, template);
    }
    
    if (limitedWaitingList.length > 0) {
      toast({
        title: "Notifications Sent",
        description: `Waiting list notifications sent to ${limitedWaitingList.length} players.`,
      });
    }
  } catch (error) {
    console.error("Error sending waiting list notifications:", error);
    toast({
      title: "Notification Error",
      description: "Failed to send some waiting list notifications.",
      variant: "destructive",
    });
  }
};

/**
 * Send player suspension notification
 * @param {string} playerEmail - Email address of the suspended player
 * @param {object} suspensionDetails - Details about the suspension
 * @returns {Promise<void>}
 */
export const sendPlayerSuspensionNotification = async (
  playerEmail: string,
  suspensionDetails: { duration: number; reason: string; endDate: string }
): Promise<void> => {
  try {
    // For demo, using template approach
    const template: EmailTemplate = {
      subject: "⚠️ Account Suspension Notice",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 5px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
            <h1 style="color: #ef4444; margin: 0; padding: 0;">Account Suspended</h1>
          </div>
          
          <div style="padding: 20px 0;">
            <p style="margin-bottom: 15px;">Dear Player,</p>
            <p style="margin-bottom: 15px;">We regret to inform you that your account has been suspended.</p>
            
            <div style="background-color: #fee2e2; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${suspensionDetails.duration} days</p>
              <p style="margin: 5px 0;"><strong>Until:</strong> ${suspensionDetails.endDate}</p>
              <p style="margin: 5px 0;"><strong>Reason:</strong> ${suspensionDetails.reason}</p>
            </div>
            
            <p style="margin-bottom: 15px;">During this period, you will not be able to join or participate in games. If you believe this is in error, please contact our support team.</p>
            <p style="margin-bottom: 15px;">Your account will be automatically reinstated after the suspension period ends.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="#" style="display: inline-block; background-color: #6b7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Contact Support</a>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; color: #718096; font-size: 12px;">
            <p>© 2025 Football Reservations App. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    
    console.log(`Sending suspension notification to: ${playerEmail}`);
    await sendEmail(playerEmail, template);
    
    // Log success
    console.log(`Suspension notification sent to ${playerEmail} for ${suspensionDetails.duration} days`);
    
    // Show success toast
    toast({
      title: "Suspension Notice Sent",
      description: `Suspension notification sent to ${playerEmail}.`,
    });
  } catch (error) {
    console.error("Error sending suspension notification:", error);
    toast({
      title: "Notification Error",
      description: "Failed to send suspension notification.",
      variant: "destructive",
    });
  }
};

/**
 * Send game joined confirmation to player
 * @param {string} playerEmail - Player's email address
 * @param {object} gameDetails - Game details
 */
export const sendGameJoinedConfirmation = async (
  playerEmail: string,
  gameDetails: { title: string; date: string; time: string; location: string }
): Promise<void> => {
  const template: EmailTemplate = {
    subject: `✅ Game Confirmation: ${gameDetails.title}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 5px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <h1 style="color: #0F766E; margin: 0; padding: 0;">Game Confirmation</h1>
        </div>
        
        <div style="padding: 20px 0;">
          <p style="margin-bottom: 15px;">Dear Player,</p>
          <p style="margin-bottom: 15px;">Your spot has been confirmed for the following game:</p>
          
          <div style="background-color: #f7fafc; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Game:</strong> ${gameDetails.title}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${gameDetails.date}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${gameDetails.time}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${gameDetails.location}</p>
          </div>
          
          <p style="margin-bottom: 15px;">We look forward to seeing you there! Please arrive 15 minutes before the start time.</p>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; color: #718096; font-size: 12px;">
          <p>© 2025 Football Reservations App. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  
  await sendEmail(playerEmail, template);
};
