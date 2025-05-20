
/**
 * Email notification utility functions
 * These functions would normally use a backend API to send actual emails
 * For now, they just simulate the email sending process
 */

/**
 * Send a notification email to players about a game update
 * @param playerEmails - Array of player email addresses
 * @param subject - Email subject line
 * @param message - Email message body
 * @returns Promise resolving to success/failure status
 */
export const sendNotificationToPlayers = async (
  playerEmails: string[],
  subject: string,
  message: string
): Promise<{ success: boolean; message: string }> => {
  // In a real implementation, this would connect to a backend API
  // or email service to send actual emails
  
  console.log("Sending notification emails:");
  console.log("To:", playerEmails);
  console.log("Subject:", subject);
  console.log("Message:", message);
  
  // Simulate API call with a slight delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Email notification sent to ${playerEmails.length} players`
      });
    }, 1000);
  });
};

/**
 * Send a cancellation notice to players about a deleted game
 * @param playerEmails - Array of player email addresses
 * @param gameDetails - Object containing game details (title, date, etc.)
 * @returns Promise resolving to success/failure status
 */
export const sendGameCancellationNotice = async (
  playerEmails: string[],
  gameDetails: { title: string; date: string; time: string; location: string }
): Promise<{ success: boolean; message: string }> => {
  const subject = `Game Cancellation: ${gameDetails.title}`;
  const message = `
    Dear Player,
    
    We regret to inform you that the following game has been cancelled:
    
    Game: ${gameDetails.title}
    Date: ${gameDetails.date}
    Time: ${gameDetails.time}
    Location: ${gameDetails.location}
    
    We apologize for any inconvenience this may cause.
    
    Regards,
    The Admin Team
  `;
  
  return sendNotificationToPlayers(playerEmails, subject, message);
};

/**
 * Send a suspension notice to a player
 * @param playerEmail - Email address of the suspended player
 * @param reason - Reason for suspension
 * @returns Promise resolving to success/failure status
 */
export const sendPlayerSuspensionNotice = async (
  playerEmail: string,
  reason: string
): Promise<{ success: boolean; message: string }> => {
  const subject = "Account Suspension Notice";
  const message = `
    Dear Player,
    
    Your account has been temporarily suspended due to:
    
    ${reason}
    
    If you believe this is an error, please contact the admin team.
    
    Regards,
    The Admin Team
  `;
  
  return sendNotificationToPlayers([playerEmail], subject, message);
};
