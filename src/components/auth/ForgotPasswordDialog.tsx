import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword, verifyOtp, resetPassword } from "@/services/passwordResetApi";
import { Mail, Lock, CheckCircle, ArrowLeft, Send, Shield, Key, AlertCircle } from "lucide-react";

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'otp' | 'password' | 'success';

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setIsLoading(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Sending OTP to:', email);
      await forgotPassword({ email: email.trim() });
      setStep('otp');
      toast({
        title: "OTP Sent Successfully! 📧",
        description: "Please check your email for the 6-digit verification code.",
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMessage = error instanceof Error ? error.message : "Please try again or contact support.";
      setError(errorMessage);
      toast({
        title: "Failed to Send OTP",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Incomplete Code",
        description: "Please enter the complete 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Verifying OTP for:', email, 'with code:', otp);
      await verifyOtp({ email: email.trim(), otp });
      setStep('password');
      toast({
        title: "Code Verified! ✅",
        description: "Now create your new password.",
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error instanceof Error ? error.message : "Please check the code and try again.";
      setError(errorMessage);
      toast({
        title: "Invalid Verification Code",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter and confirm your new password.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Resetting password for:', email);
      await resetPassword({ 
        email: email.trim(), 
        newPassword: newPassword.trim(), 
        confirmPassword: confirmPassword.trim() 
      });
      setStep('success');
      toast({
        title: "Password Reset Successful! 🎉",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage = error instanceof Error ? error.message : "Please try again or contact support.";
      setError(errorMessage);
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await forgotPassword({ email: email.trim() });
      toast({
        title: "Code Resent! 📧",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to resend code.";
      setError(errorMessage);
      toast({
        title: "Failed to Resend Code",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-full">
          <Mail className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Reset Your Password</h3>
          <p className="text-sm text-gray-600">Enter your email to receive a verification code</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="h-11"
        />
      </div>

      {error && (
        <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
        </div>
      )}
      
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSendOtp} disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Send className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Code
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-full">
          <Shield className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Enter Verification Code</h3>
          <p className="text-sm text-gray-600">We sent a 6-digit code to your email</p>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        📧 Check your email: <strong className="text-gray-900">{email}</strong>
        <br />
        <span className="text-xs text-gray-500 mt-1 block">Don't see it? Check your spam folder</span>
      </div>
      
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
            <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
            <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
            <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
            <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
            <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && (
        <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
        </div>
      )}

      <div className="text-center">
        <Button
          variant="link"
          onClick={handleResendOtp}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-800"
        >
          Resend Code
        </Button>
      </div>
      
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => setStep('email')} disabled={isLoading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 6} className="flex-1">
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-full">
          <Lock className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Create New Password</h3>
          <p className="text-sm text-gray-600">Choose a strong password for your account</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            className="h-11"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="h-11"
          />
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>Password requirements:</strong>
          <ul className="mt-1 space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Contains letters and numbers</li>
            <li>• Strong and unique</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
        </div>
      )}
      
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => setStep('otp')} disabled={isLoading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleResetPassword} disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Key className="w-4 h-4 mr-2 animate-pulse" />
              Updating...
            </>
          ) : (
            <>
              <Key className="w-4 h-4 mr-2" />
              Update Password
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="p-4 bg-green-100 rounded-full">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-green-600 mb-2">Password Reset Complete! 🎉</h3>
        <p className="text-gray-600 mb-4">
          Your password has been successfully updated. You can now login with your new password.
        </p>
        <div className="text-sm text-gray-500 bg-green-50 p-3 rounded-lg">
          Remember to keep your password safe and don't share it with anyone.
        </div>
      </div>
      
      <Button onClick={handleClose} className="w-full h-11 font-medium">
        Continue to Login
      </Button>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Forgot Password';
      case 'otp':
        return 'Verify Email';
      case 'password':
        return 'Reset Password';
      case 'success':
        return 'Success';
      default:
        return 'Forgot Password';
    }
  };

  const getStepIndicator = () => {
    const steps = ['email', 'otp', 'password', 'success'];
    const currentIndex = steps.indexOf(step);
    
    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentIndex 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}>
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 ${
                index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{getStepTitle()}</DialogTitle>
        </DialogHeader>
        
        {getStepIndicator()}
        
        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'password' && renderPasswordStep()}
        {step === 'success' && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
