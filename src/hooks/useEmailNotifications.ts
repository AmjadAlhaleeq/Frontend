
import { useState } from 'react';
import { useToast } from './use-toast';
import { sendReservationConfirmation, sendTestEmail } from '@/utils/emailService';

/**
 * Custom hook for handling email notifications
 * Provides functions for sending different types of email notifications
 */
export const useEmailNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Send a booking confirmation email
   * 
   * @param {string} userEmail - Recipient email address
   * @param {string} userName - User's name
   * @param {object} reservationDetails - Details of the reservation
   * @returns {Promise<boolean>} - Whether the email was sent successfully
   */
  const sendBookingConfirmation = async (
    userEmail: string,
    userName: string,
    reservationDetails: {
      pitchName: string;
      date: string;
      time: string;
      location?: string;
    }
  ) => {
    setIsLoading(true);
    
    try {
      await sendReservationConfirmation(userEmail, userName, reservationDetails);
      
      toast({
        title: "Email Sent",
        description: `Booking confirmation sent to ${userEmail}`,
      });
      
      return true;
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      
      toast({
        title: "Email Failed",
        description: "Could not send confirmation email. Please try again later.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send a test email to verify EmailJS configuration
   * 
   * @returns {Promise<boolean>} - Whether the test email was sent successfully
   */
  const sendTest = async () => {
    setIsLoading(true);
    
    try {
      await sendTestEmail();
      
      toast({
        title: "Test Email Sent",
        description: "Test email was sent successfully. Check your inbox.",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to send test email:", error);
      
      toast({
        title: "Test Email Failed",
        description: "Could not send test email. Check EmailJS configuration.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendBookingConfirmation,
    sendTest
  };
};
