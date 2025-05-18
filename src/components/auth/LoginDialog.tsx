
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, UserPlus, KeyRound } from "lucide-react";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void; // Callback for successful login
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    // In a real app, you'd call an auth API here
    console.log("Attempting login with:", { email, password });
    toast({
      title: "Login Attempted",
      description: `Email: ${email}`, // Don't show password in toast
    });
    // Simulate successful login
    onLoginSuccess(); 
    onClose(); // Close the dialog on successful login
  };

  const handleSignUpClick = () => {
    toast({ title: "Sign Up", description: "Sign up functionality coming soon!" });
    // In a real app, this might open a different dialog or navigate to a sign-up page
  };

  const handleForgotPasswordClick = () => {
    toast({ title: "Forgot Password", description: "Password recovery coming soon!" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LogIn className="mr-2 h-5 w-5" /> Login to Your Account
          </DialogTitle>
          <DialogDescription>
            Access your reservations and manage your pitches.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-login" className="text-right">
                Email
              </Label>
              <Input
                id="email-login"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="you@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-login" className="text-right">
                Password
              </Label>
              <Input
                id="password-login"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center">
            <Button type="button" variant="link" onClick={handleForgotPasswordClick} className="p-0 h-auto text-sm">
              <KeyRound className="mr-1 h-4 w-4" /> Forgot Password?
            </Button>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button type="button" variant="outline" onClick={handleSignUpClick}>
                 <UserPlus className="mr-2 h-4 w-4" /> Sign Up
              </Button>
              <DialogClose asChild>
                 <Button type="submit" className="bg-[#0F766E] hover:bg-[#0d6d66]">
                   <LogIn className="mr-2 h-4 w-4" /> Login
                 </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
