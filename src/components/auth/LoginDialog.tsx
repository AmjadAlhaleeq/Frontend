import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { useToast } from "@/hooks/use-toast";
import {
  LogIn,
  UserPlus,
  KeyRound,
  UserCircle2,
  AtSign,
  Phone,
  MapPin,
  CalendarDays,
  Shirt,
  Users,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginWithTestAccount } from "@/utils/testAccounts";

// API Base URL
const API_BASE_URL = "http://127.0.0.1:3000";

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Types for API responses
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  age: number;
  bio?: string;
  profilePicture?: string;
  role: "admin" | "player";
  preferredPosition?: string;
  stats?: {
    matches: number;
    wins: number;
    mvp: number;
    goals: number;
    assists: number;
    interceptions: number;
    cleanSheets: number;
  };
  suspendedUntil?: string | null;
  badges?: string[];
}

interface SignUpResponse {
  user: UserData;
  token: string;
}

interface LoginResponse {
  user: UserData;
  token: string;
}

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
}

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // Updated to pass user details along with the role
  onLoginSuccess: (
    role: "admin" | "player",
    userDetails?: UserProfileData
  ) => void;
}

/**
 * LoginDialog component for user authentication
 *
 * @remarks
 * This component is designed to work with a Node.js/MongoDB backend.
 * Form fields match expected MongoDB schema.
 */
const LoginDialog: React.FC<LoginDialogProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [formType, setFormType] = useState<"login" | "signup">("login");
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
  const [bio, setBio] = useState("");

  // Store current page URL when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(window.location.pathname);
    }
  }, [isOpen]);

  // Initialize axios interceptors for token management
  useEffect(() => {
    // Request interceptor to add auth token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          localStorage.removeItem("userRole");
          localStorage.removeItem("isLoggedIn");
          window.dispatchEvent(new Event("loginStatusChanged"));
          delete axios.defaults.headers.common["Authorization"];
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Handle forgot password navigation
  const handleForgotPassword = () => {
    console.log("Navigating to forgot password page");
    onClose(); // Close the auth dialog
    navigate("/forgot-password"); // Navigate to the forgot password page
  };

  /**
   * Handles the login form submission.
   * Validates input fields and attempts login against backend API.
   *
   * @param e - The form event.
   */
  const handleLogin = async (e: React.FormEvent) => {
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
    if (loginEmail.toLowerCase().includes("admin")) {
      // Use the test admin account
      if (loginWithTestAccount("admin")) {
        toast({
          title: "Admin Login Successful",
          description: "Welcome back, Admin!",
        });
        onLoginSuccess("admin");
        onClose();
        resetForms();
        // Navigate to home page
        navigate("/");
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
    if (
      loginEmail === "testplayer@example.com" &&
      loginPassword === "testplayer"
    ) {
      if (loginWithTestAccount("player")) {
        toast({
          title: "Player Login Successful",
          description: "Welcome back, Player!",
        });
        onLoginSuccess("player");
        onClose();
        resetForms();
        // Navigate to home page
        navigate("/");
      }
      setIsProcessing(false);
      return;
    }

    try {
      const response = await axios.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        {
          email: loginEmail,
          password: loginPassword,
        }
      );

      if (response.data.status === "success") {
        const { user, token } = response.data.data;

        // Store user data in localStorage with the exact format expected by the app
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age.toString(),
            city: user.city,
            position: user.preferredPosition || "",
            phoneNumber: user.phone,
          })
        );

        // Set auth tokens and user role
        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("isLoggedIn", "true");

        // Set first time login flag
        localStorage.setItem("firstTimeLogin", "true");

        // Set axios default authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Dispatch login events
        window.dispatchEvent(new Event("loginStatusChanged"));
        window.dispatchEvent(new Event("userLoggedIn"));

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.firstName}!`,
        });

        // Pass user details to onLoginSuccess
        onLoginSuccess(user.role, {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age.toString(),
          city: user.city,
          favoritePosition: user.preferredPosition || "",
          phoneNumber: user.phone,
          email: user.email,
          password: "", // Don't store password
        });

        onClose();
        resetForms();

        // Navigate to home page
        navigate("/");
      }
    } catch (error: Error | any) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid email or password.";
      } else if (error.response?.status === 404) {
        errorMessage = "User not found. Please sign up first.";
      } else if (
        error.code === "ECONNREFUSED" ||
        error.code === "ERR_NETWORK"
      ) {
        errorMessage = "Unable to connect to server. Please try again later.";
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // If user not found, suggest signing up
      if (error.response?.status === 404) {
        setTimeout(() => setFormType("signup"), 1000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles the sign-up form submission.
   * Validates input fields, registers new user with backend API.
   *
   * @param e - The form event.
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const allFieldsFilled =
      firstName &&
      lastName &&
      age &&
      city &&
      phoneNumber &&
      signUpEmail &&
      signUpPassword &&
      confirmPassword;
    if (!allFieldsFilled) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields.",
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

    // Basic password validation
    if (signUpPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const signUpData = {
        firstName,
        lastName,
        email: signUpEmail,
        password: signUpPassword,
        phone: phoneNumber,
        city,
        preferredPosition: favoritePosition || " ",
        age: parseInt(age),
        bio: bio || `I love football and play from ${city}.`,
        profilePicture: "",
        role: "player" as const,
      };

      const response = await axios.post<ApiResponse<SignUpResponse>>(
        "/auth/signup",
        signUpData
      );

      if (response.data.status === "success") {
        toast({
          title: "Sign Up Successful",
          description: `Welcome to our community, ${firstName}! You can now log in.`,
        });

        // Switch to login form with email prefilled
        setFormType("login");
        setLoginEmail(signUpEmail);
        setLoginPassword("");
      }
    } catch (error: any) {
      console.error("Signup error:", error);

      let errorMessage = "Sign up failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (error.response?.status === 409) {
        errorMessage =
          "Email already exists. Please use a different email or login.";
      } else if (
        error.code === "ECONNREFUSED" ||
        error.code === "ERR_NETWORK"
      ) {
        errorMessage = "Unable to connect to server. Please try again later.";
      }

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // If email already exists, suggest logging in
      if (error.response?.status === 409) {
        setTimeout(() => {
          setFormType("login");
          setLoginEmail(signUpEmail);
        }, 1000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Toggles between login and sign-up forms.
   * @param type - The form type to switch to ('login' or 'signup').
   */
  const toggleFormType = (type: "login" | "signup") => {
    setFormType(type);
    resetForms(); // Reset form fields when switching
  };

  const resetForms = () => {
    setLoginEmail("");
    setLoginPassword("");
    resetSignUpForm();
  };

  const resetSignUpForm = () => {
    setFirstName("");
    setLastName("");
    setAge("");
    setCity("");
    setFavoritePosition("");
    setPhoneNumber("");
    setSignUpEmail("");
    setSignUpPassword("");
    setConfirmPassword("");
    setBio("");
  };

  const handleDialogClose = () => {
    resetForms();
    onClose();
  };

  // Render login form
  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <DialogHeader className="mb-4">
        <DialogTitle className="flex items-center text-2xl">
          <LogIn className="mr-2 h-6 w-6 text-bokit-500" /> Login to Your
          Account
        </DialogTitle>
        <DialogDescription>
          Access your reservations and manage your pitches.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 items-center gap-2">
          <Label htmlFor="email-login" className="flex items-center">
            <AtSign className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Email
          </Label>
          <Input
            id="email-login"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            required
          />
        </div>
        <div className="grid grid-cols-1 items-center gap-2">
          <Label htmlFor="password-login" className="flex items-center">
            <KeyRound className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Password
          </Label>
          <Input
            id="password-login"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            required
          />
        </div>
      </div>
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center mt-2">
        <Button
          type="button"
          variant="link"
          onClick={handleForgotPassword}
          className="p-0 h-auto text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          disabled={isProcessing}
        >
          <KeyRound className="mr-1 h-4 w-4" /> Forgot Password?
        </Button>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => toggleFormType("signup")}
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
            {isProcessing ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            {isProcessing ? "Processing..." : "Login"}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );

  // Render sign-up form
  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp}>
      <DialogHeader className="mb-4">
        <DialogTitle className="flex items-center text-2xl">
          <UserPlus className="mr-2 h-6 w-6 text-bokit-500" /> Create Your
          Account
        </DialogTitle>
        <DialogDescription>
          Join our community and start booking pitches! All fields are required.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="space-y-1">
          <Label
            htmlFor="firstName"
            className="flex items-center dark:text-gray-300"
          >
            <UserCircle2 className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            First Name
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ahmad"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            required
          />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="lastName"
            className="flex items-center dark:text-gray-300"
          >
            <UserCircle2 className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Last Name
          </Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Naser"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="age" className="flex items-center dark:text-gray-300">
            <CalendarDays className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Age
          </Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="25"
            min="16"
            max="100"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            required
          />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="city"
            className="flex items-center dark:text-gray-300"
          >
            <MapPin className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            City
          </Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Amman"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            required
          />
        </div>
        {/* <div className="space-y-1">
          <Label
            htmlFor="favoritePosition"
            className="flex items-center dark:text-gray-300"
          >
            <Shirt className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Preferred Position
          </Label>
          <Input
            id="favoritePosition"
            value={favoritePosition}
            onChange={(e) => setFavoritePosition(e.target.value)}
            placeholder="Midfielder"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div> */}
        <div className="space-y-1">
          <Label
            htmlFor="phoneNumber"
            className="flex items-center dark:text-gray-300"
          >
            <Phone className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+962790123456"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            required
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label
            htmlFor="email-signup"
            className="flex items-center dark:text-gray-300"
          >
            <AtSign className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Email
          </Label>
          <Input
            id="email-signup"
            type="email"
            value={signUpEmail}
            onChange={(e) => setSignUpEmail(e.target.value)}
            placeholder="ahmad.naser@example.com"
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            required
          />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="password-signup"
            className="flex items-center dark:text-gray-300"
          >
            <KeyRound className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Password
          </Label>
          <Input
            id="password-signup"
            type="password"
            value={signUpPassword}
            onChange={(e) => setSignUpPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            required
          />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="confirmPassword"
            className="flex items-center dark:text-gray-300"
          >
            <KeyRound className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            required
          />
        </div>
        {/* <div className="space-y-1 md:col-span-2">
          <Label htmlFor="bio" className="flex items-center dark:text-gray-300">
            <Users className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            Bio (Optional)
          </Label>
          <Input
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="I love football and play every weekend."
            className="border-gray-300 focus:border-bokit-500 focus:ring-bokit-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
          />
        </div> */}
      </div>
      <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center mt-4">
        <Button
          type="button"
          variant="link"
          onClick={() => toggleFormType("login")}
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
          {isProcessing ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          {isProcessing ? "Creating Account..." : "Sign Up"}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out bg-white dark:bg-gray-800 border dark:border-gray-700">
        {formType === "login" ? renderLoginForm() : renderSignUpForm()}
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
