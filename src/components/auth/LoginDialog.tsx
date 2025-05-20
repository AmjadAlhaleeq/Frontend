
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, UserPlus, KeyRound, UserCircle2, AtSign, Phone, MapPin, CalendarDays, Shirt, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Define a type for the user's profile data
interface UserProfileData {
  id: string; // Usually email or a unique ID from backend
  firstName: string;
  lastName: string;
  age: string;
  city: string;
  favoritePosition: string;
  phoneNumber: string;
  email: string;
  // avatarUrl could be added here if collected during signup or defaulted
}

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // Updated to pass user details along with the role
  onLoginSuccess: (role: 'admin' | 'player', userDetails?: UserProfileData) => void;
}

/**
 * LoginDialog component for user authentication
 * 
 * @remarks
 * This component is designed to work with a Node.js/MongoDB backend.
 * Form fields match expected MongoDB schema.
 */
const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [formType, setFormType] = useState<'login' | 'signup'>('login');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign-up states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [favoritePosition, setFavoritePosition] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /**
   * Handles the login form submission.
   * Validates input fields and simulates a login attempt.
   * Stores role and basic user info in localStorage.
   * 
   * @remarks
   * In production, this would connect to a Node.js/MongoDB backend
   * 
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
    
    // Simulate admin/player login
    const role = loginEmail.toLowerCase().includes('admin') ? 'admin' : 'player';
    // Simulate fetching minimal user details for login
    const loggedInUserDetails: UserProfileData = {
      id: loginEmail,
      email: loginEmail,
      firstName: role === 'admin' ? 'Admin' : 'Player', // Placeholder name
      lastName: "User", // Placeholder name
      // Fill other fields with placeholders or fetch them if login returns more data
      age: "", city: "", favoritePosition: "", phoneNumber: "",
    };
    
    // Store role and user details in localStorage
    localStorage.setItem('userRole', role);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUserDetails));
    localStorage.setItem('isLoggedIn', 'true');
    
    // Set first-time login flag for home page redirect
    localStorage.setItem("firstTimeLogin", "true");

    toast({
      title: "Login Successful",
      description: `Welcome back, ${loggedInUserDetails.firstName}! Role: ${role}`,
    });
    onLoginSuccess(role, loggedInUserDetails);
    onClose();
    resetForms();
    
    // Navigate to home page
    navigate('/');
  };

  /**
   * Handles the sign-up form submission.
   * Validates input fields, simulates a sign-up attempt, and then logs the user in.
   * Stores new user details and role ('player') in localStorage.
   * 
   * @remarks
   * In production, this would connect to a Node.js/MongoDB backend
   * 
   * @param e - The form event.
   */
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const allFieldsFilled = firstName && lastName && age && city && favoritePosition && phoneNumber && signUpEmail && signUpPassword && confirmPassword;
    if (!allFieldsFilled) {
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
    
    // In a real app, you'd call a MongoDB/Node.js sign-up API here
    console.log("Attempting sign-up with:", { firstName, lastName, email: signUpEmail /* other fields */ });

    const newUserDetails: UserProfileData = {
      id: signUpEmail, // Use email as ID for simplicity
      firstName,
      lastName,
      age,
      city,
      favoritePosition,
      phoneNumber,
      email: signUpEmail,
    };

    // Store new user details and role in localStorage
    localStorage.setItem('userRole', 'player'); // New sign-ups are players
    localStorage.setItem('currentUser', JSON.stringify(newUserDetails));
    localStorage.setItem('isLoggedIn', 'true');
    
    // Set first-time login flag for home page redirect
    localStorage.setItem("firstTimeLogin", "true");

    toast({
      title: "Sign Up Successful!",
      description: `Welcome, ${firstName}! You are now logged in.`,
      variant: "default"
    });
    
    // Call onLoginSuccess to update Navbar state and treat signup as login
    onLoginSuccess('player', newUserDetails);
    onClose(); 
    resetForms();
    
    // Navigate to home page
    navigate('/');
  };
  
  /**
   * Toggles between login and sign-up forms.
   * @param type - The form type to switch to ('login' or 'signup').
   */
  const toggleFormType = (type: 'login' | 'signup') => {
    setFormType(type);
    resetForms(); // Reset form fields when switching
  };

  const resetForms = () => {
    setLoginEmail("");
    setLoginPassword("");
    setFirstName("");
    setLastName("");
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

  // Render login form (no significant changes, but ensure it uses the correct focus colors if needed)
  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <DialogHeader className="mb-4">
        <DialogTitle className="flex items-center text-2xl">
          <LogIn className="mr-2 h-6 w-6 text-bokit-500" /> Login to Your Account
        </DialogTitle>
        <DialogDescription>
          Access your reservations and manage your pitches. Use 'admin@example.com' for admin access.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 items-center gap-2">
          <Label htmlFor="email-login" className="flex items-center"><AtSign className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Email</Label>
          <Input
            id="email-login"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-1 items-center gap-2">
          <Label htmlFor="password-login" className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Password</Label>
          <Input
            id="password-login"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center mt-2">
        <Button type="button" variant="link" onClick={() => toast({ title: "Forgot Password", description: "Password recovery coming soon!" })} className="p-0 h-auto text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
          <KeyRound className="mr-1 h-4 w-4" /> Forgot Password?
        </Button>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button type="button" variant="outline" onClick={() => toggleFormType('signup')} className="border-sky-500 text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-300">
             <UserPlus className="mr-2 h-4 w-4" /> Sign Up
          </Button>
          <Button type="submit" className="bg-bokit-500 hover:bg-bokit-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
             <LogIn className="mr-2 h-4 w-4" /> Login
           </Button>
        </div>
      </DialogFooter>
    </form>
  );

  // Render sign-up form (without gender field)
  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp}>
      <DialogHeader className="mb-4">
        <DialogTitle className="flex items-center text-2xl">
          <UserPlus className="mr-2 h-6 w-6 text-bokit-500" /> Create Your Account
        </DialogTitle>
        <DialogDescription>
          Join our community and start booking pitches! All fields are required.
        </DialogDescription>
      </DialogHeader>
      {/* Added dark mode classes to inputs and labels where appropriate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="space-y-1">
          <Label htmlFor="firstName" className="flex items-center dark:text-gray-300"><UserCircle2 className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>First Name</Label>
          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName" className="flex items-center dark:text-gray-300"><UserCircle2 className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Last Name</Label>
          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="age" className="flex items-center dark:text-gray-300"><CalendarDays className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Age</Label>
          <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="city" className="flex items-center dark:text-gray-300"><MapPin className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>City</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Amman" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="favoritePosition" className="flex items-center dark:text-gray-300"><Shirt className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Favorite Position</Label>
          <Input id="favoritePosition" value={favoritePosition} onChange={(e) => setFavoritePosition(e.target.value)} placeholder="Forward" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="phoneNumber" className="flex items-center dark:text-gray-300"><Phone className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Phone Number</Label>
          <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="07X XXX XXXX" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"/>
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="email-signup" className="flex items-center dark:text-gray-300"><AtSign className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Email</Label>
          <Input id="email-signup" type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} placeholder="you@example.com" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="password-signup" className="flex items-center dark:text-gray-300"><KeyRound className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Password</Label>
          <Input id="password-signup" type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} placeholder="••••••••" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"/>
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="flex items-center dark:text-gray-300"><KeyRound className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Confirm Password</Label>
          <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"/>
        </div>
      </div>
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center mt-4">
        <Button type="button" variant="link" onClick={() => toggleFormType('login')} className="p-0 h-auto text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
          Already have an account? Login
        </Button>
        <Button type="submit" className="bg-bokit-500 hover:bg-bokit-600 text-white mt-2 sm:mt-0 dark:bg-blue-600 dark:hover:bg-blue-700">
          <UserPlus className="mr-2 h-4 w-4" /> Sign Up
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      {/* Adjusted dialog content style for better dark mode appearance */}
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out bg-white dark:bg-gray-800 border dark:border-gray-700">
        {formType === 'login' ? renderLoginForm() : renderSignUpForm()}
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
