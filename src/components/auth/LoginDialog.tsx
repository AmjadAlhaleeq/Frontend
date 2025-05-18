
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
import { LogIn, UserPlus, KeyRound, UserCircle2, AtSign, Phone, MapPin, CalendarDays, Shirt, Users } from "lucide-react";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: 'admin' | 'player') => void; // Updated to pass a role
  // We can add onSignUpSuccess later if needed for specific actions after signup
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [formType, setFormType] = useState<'login' | 'signup'>('login');
  const { toast } = useToast();

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign-up states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState(""); // Could be select: Male, Female, Other
  const [age, setAge] = useState(""); // Could be number input
  const [city, setCity] = useState("");
  const [favoritePosition, setFavoritePosition] = useState(""); // e.g., Striker, Midfielder
  const [phoneNumber, setPhoneNumber] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /**
   * Handles the login form submission.
   * Validates input fields and simulates a login attempt.
   * @param e - The form event.
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    console.log("Attempting login with:", { email: loginEmail, password: loginPassword });
    
    // Simulate admin/player login for now
    // In a real app, API would return role
    const role = loginEmail.includes('admin') ? 'admin' : 'player'; 
    
    toast({
      title: "Login Attempted",
      description: `Email: ${loginEmail}. Role: ${role}`,
    });
    onLoginSuccess(role);
    onClose();
    resetForms();
  };

  /**
   * Handles the sign-up form submission.
   * Validates input fields and simulates a sign-up attempt.
   * @param e - The form event.
   */
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation for all fields
    if (!firstName || !lastName || !gender || !age || !city || !favoritePosition || !phoneNumber || !signUpEmail || !signUpPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill out all sign-up fields.",
        variant: "destructive",
      });
      return;
    }
    if (signUpPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    // In a real app, you'd call a sign-up API here
    console.log("Attempting sign-up with:", { firstName, lastName, gender, age, city, favoritePosition, phoneNumber, email: signUpEmail });
    toast({
      title: "Sign Up Successful (Simulated)",
      description: `Welcome, ${firstName}! Please log in.`,
      variant: "default"
    });
    // For now, after sign up, switch to login form
    setFormType('login'); 
    // onSignUpSuccess might be called here in a real scenario
    onClose(); // Or keep open and switch to login view with a message
    resetForms();
  };
  
  /**
   * Toggles between login and sign-up forms.
   * @param type - The form type to switch to ('login' or 'signup').
   */
  const toggleFormType = (type: 'login' | 'signup') => {
    setFormType(type);
    resetForms(); // Reset form fields when switching
  };

  /**
   * Resets all form input fields.
   */
  const resetForms = () => {
    setLoginEmail("");
    setLoginPassword("");
    setFirstName("");
    setLastName("");
    setGender("");
    setAge("");
    setCity("");
    setFavoritePosition("");
    setPhoneNumber("");
    setSignUpEmail("");
    setSignUpPassword("");
    setConfirmPassword("");
  };

  const handleDialogClose = () => {
    resetForms();
    onClose();
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <DialogHeader className="mb-4">
        <DialogTitle className="flex items-center text-2xl">
          <LogIn className="mr-2 h-6 w-6 text-bokit-500" /> Login to Your Account
        </DialogTitle>
        <DialogDescription>
          Access your reservations and manage your pitches.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 items-center gap-2">
          <Label htmlFor="email-login" className="flex items-center"><AtSign className="mr-2 h-4 w-4 text-gray-500"/>Email</Label>
          <Input
            id="email-login"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"
          />
        </div>
        <div className="grid grid-cols-1 items-center gap-2">
          <Label htmlFor="password-login" className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-gray-500"/>Password</Label>
          <Input
            id="password-login"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"
          />
        </div>
      </div>
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center mt-2">
        <Button type="button" variant="link" onClick={() => toast({ title: "Forgot Password", description: "Password recovery coming soon!" })} className="p-0 h-auto text-sm text-sky-600 hover:text-sky-700">
          <KeyRound className="mr-1 h-4 w-4" /> Forgot Password?
        </Button>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button type="button" variant="outline" onClick={() => toggleFormType('signup')} className="border-sky-500 text-sky-600 hover:bg-sky-50 hover:text-sky-700">
             <UserPlus className="mr-2 h-4 w-4" /> Sign Up
          </Button>
          <Button type="submit" className="bg-bokit-500 hover:bg-bokit-600 text-white">
             <LogIn className="mr-2 h-4 w-4" /> Login
           </Button>
        </div>
      </DialogFooter>
    </form>
  );

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp}>
      <DialogHeader className="mb-4">
        <DialogTitle className="flex items-center text-2xl">
          <UserPlus className="mr-2 h-6 w-6 text-bokit-500" /> Create Your Account
        </DialogTitle>
        <DialogDescription>
          Join our community and start booking pitches!
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
        {/* Input fields with icons and improved layout */}
        <div className="space-y-1">
          <Label htmlFor="firstName" className="flex items-center"><UserCircle2 className="mr-2 h-4 w-4 text-gray-500"/>First Name</Label>
          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName" className="flex items-center"><UserCircle2 className="mr-2 h-4 w-4 text-gray-500"/>Last Name</Label>
          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="gender" className="flex items-center"><Users className="mr-2 h-4 w-4 text-gray-500"/>Gender</Label>
          <Input id="gender" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Male/Female/Other" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="age" className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-gray-500"/>Age</Label>
          <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="city" className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-gray-500"/>City</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Amman" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="favoritePosition" className="flex items-center"><Shirt className="mr-2 h-4 w-4 text-gray-500"/>Favorite Position</Label>
          <Input id="favoritePosition" value={favoritePosition} onChange={(e) => setFavoritePosition(e.target.value)} placeholder="Forward" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"/>
        </div>
        <div className="space-y-1 md:col-span-2"> {/* Phone number can span full width on mobile */}
          <Label htmlFor="phoneNumber" className="flex items-center"><Phone className="mr-2 h-4 w-4 text-gray-500"/>Phone Number (Jordan)</Label>
          <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="07X XXX XXXX" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"/>
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="email-signup" className="flex items-center"><AtSign className="mr-2 h-4 w-4 text-gray-500"/>Email</Label>
          <Input id="email-signup" type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} placeholder="you@example.com" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="password-signup" className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-gray-500"/>Password</Label>
          <Input id="password-signup" type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} placeholder="••••••••" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-gray-500"/>Confirm Password</Label>
          <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500"/>
        </div>
      </div>
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center mt-4">
        <Button type="button" variant="link" onClick={() => toggleFormType('login')} className="p-0 h-auto text-sm text-sky-600 hover:text-sky-700">
          Already have an account? Login
        </Button>
        <Button type="submit" className="bg-bokit-500 hover:bg-bokit-600 text-white mt-2 sm:mt-0">
          <UserPlus className="mr-2 h-4 w-4" /> Sign Up
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out"> {/* Increased max-width for signup form */}
        {formType === 'login' ? renderLoginForm() : renderSignUpForm()}
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
