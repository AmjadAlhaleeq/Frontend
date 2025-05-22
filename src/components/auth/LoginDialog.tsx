
import React, { useState, useEffect } from "react";
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
import { LogIn, UserPlus, KeyRound, UserCircle2, AtSign, Phone, MapPin, CalendarDays, Shirt, Users, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginWithTestAccount } from "@/utils/testAccounts";

// Define a type for the user's profile data
interface UserProfileData {
  id: string; 
  firstName: string;
  lastName: string;
  age: string;
  city: string;
  favoritePosition: string;
  phoneNumber: string;
  email: string;
  password: string;
  avatarUrl?: string;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState("");

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

  // Store current page URL when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(window.location.pathname);
    }
  }, [isOpen]);

  /**
   * Handles the login form submission.
   * Validates input fields and attempts login against stored user data.
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

    setIsProcessing(true);
    
    // Check if this is admin login attempt
    if (loginEmail.toLowerCase().includes('admin')) {
      // Use the test admin account
      if (loginWithTestAccount('admin')) {
        toast({
          title: "Admin Login Successful",
          description: "Welcome back, Admin!",
        });
        onLoginSuccess('admin');
        onClose();
        resetForms();
        // Navigate to home page
        navigate('/');
      } else {
        toast({
          title: "Admin Login Failed",
          description: "Please check your credentials.",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
      return;
    }
    
    // Check if it's test player account
    if (loginEmail === "testplayer@example.com" && loginPassword === "testplayer") {
      if (loginWithTestAccount('player')) {
        toast({
          title: "Player Login Successful",
          description: "Welcome back, Player!",
        });
        onLoginSuccess('player');
        onClose();
        resetForms();
        // Navigate to home page
        navigate('/');
      }
      setIsProcessing(false);
      return;
    }
    
    // Check local storage for registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find((u: UserProfileData) => 
      u.email === loginEmail && u.password === loginPassword
    );
    
    if (user) {
      // Store user data in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.email,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        city: user.city,
        favoritePosition: user.favoritePosition,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl || `https://i.pravatar.cc/300?u=${user.email}`
      }));
      
      // Set user role
      localStorage.setItem('userRole', 'player');
      localStorage.setItem('isLoggedIn', 'true');
      
      // Set first time login flag
      localStorage.setItem("firstTimeLogin", "true");

      // Dispatch login event
      window.dispatchEvent(new Event('loginStatusChanged'));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.firstName}!`,
      });
      
      onLoginSuccess('player', user);
      onClose();
      resetForms();
      
      // Navigate to home page
      navigate('/');
    } else {
      toast({
        title: "Login Failed",
        description: "User not found. Please sign up first.",
        variant: "destructive",
      });
      // Suggest signing up by switching form type
      setTimeout(() => setFormType('signup'), 1000);
    }
    
    setIsProcessing(false);
  };

  /**
   * Handles the sign-up form submission.
   * Validates input fields, registers new user, and switches to login.
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
    
    setIsProcessing(true);
    
    // Create new user data object
    const newUserData: UserProfileData = {
      id: signUpEmail,
      firstName,
      lastName,
      age,
      city,
      favoritePosition,
      phoneNumber,
      email: signUpEmail,
      password: signUpPassword,
      avatarUrl: `https://i.pravatar.cc/300?u=${signUpEmail}`
    };

    // Store in registered users array in localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if user already exists
    if (registeredUsers.some((user: UserProfileData) => user.email === signUpEmail)) {
      toast({
        title: "User already exists",
        description: "This email is already registered. Please login instead.",
        variant: "destructive",
      });
      setFormType('login');
      setLoginEmail(signUpEmail);
      setIsProcessing(false);
      return;
    }
    
    // Add new user to array
    registeredUsers.push(newUserData);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    toast({
      title: "Sign Up Successful",
      description: "Your account has been created. Please log in now.",
      variant: "default"
    });
    
    // Switch to login form with email prefilled
    setFormType('login');
    setLoginEmail(signUpEmail);
    setLoginPassword('');
    
    setIsProcessing(false);
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
            disabled={isProcessing}
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
            disabled={isProcessing}
          />
        </div>
      </div>
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center mt-2">
        <Button type="button" variant="link" onClick={() => toast({ title: "Forgot Password", description: "Password recovery coming soon!" })} className="p-0 h-auto text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
          <KeyRound className="mr-1 h-4 w-4" /> Forgot Password?
        </Button>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => toggleFormType('signup')} 
            className="border-sky-500 text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
            disabled={isProcessing}
          >
             <UserPlus className="mr-2 h-4 w-4" /> Sign Up
          </Button>
          <Button 
            type="submit" 
            className="bg-bokit-500 hover:bg-bokit-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
            disabled={isProcessing}
          >
             {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />} 
             {isProcessing ? "Processing..." : "Login"}
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
          <Input 
            id="firstName" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            placeholder="John" 
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName" className="flex items-center dark:text-gray-300"><UserCircle2 className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Last Name</Label>
          <Input 
            id="lastName" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            placeholder="Doe" 
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="age" className="flex items-center dark:text-gray-300"><CalendarDays className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Age</Label>
          <Input 
            id="age" 
            type="number" 
            value={age} 
            onChange={(e) => setAge(e.target.value)} 
            placeholder="25" 
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="city" className="flex items-center dark:text-gray-300"><MapPin className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>City</Label>
          <Input 
            id="city" 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            placeholder="Amman" 
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="favoritePosition" className="flex items-center dark:text-gray-300"><Shirt className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Favorite Position</Label>
          <Input 
            id="favoritePosition" 
            value={favoritePosition} 
            onChange={(e) => setFavoritePosition(e.target.value)} 
            placeholder="Forward" 
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phoneNumber" className="flex items-center dark:text-gray-300"><Phone className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Phone Number</Label>
          <Input 
            id="phoneNumber" 
            type="tel" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
            placeholder="07X XXX XXXX" 
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="email-signup" className="flex items-center dark:text-gray-300"><AtSign className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Email</Label>
          <Input 
            id="email-signup" 
            type="email" 
            value={signUpEmail} 
            onChange={(e) => setSignUpEmail(e.target.value)} 
            placeholder="you@example.com" 
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password-signup" className="flex items-center dark:text-gray-300"><KeyRound className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Password</Label>
          <Input 
            id="password-signup" 
            type="password" 
            value={signUpPassword} 
            onChange={(e) => setSignUpPassword(e.target.value)} 
            placeholder="••••••••" 
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="flex items-center dark:text-gray-300"><KeyRound className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"/>Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder="••••••••" 
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div>
      </div>
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center mt-4">
        <Button 
          type="button" 
          variant="link" 
          onClick={() => toggleFormType('login')} 
          className="p-0 h-auto text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          disabled={isProcessing}
        >
          Already have an account? Login
        </Button>
        <Button 
          type="submit" 
          className="bg-bokit-500 hover:bg-bokit-600 text-white mt-2 sm:mt-0 dark:bg-blue-600 dark:hover:bg-blue-700"
          disabled={isProcessing}
        >
          {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          {isProcessing ? "Processing..." : "Sign Up"}
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
