import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Star, Users, Shield, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface HomeProps {
  /** Flag indicating if this is the user's first time logging in */
  isFirstTimeLogin?: boolean;
}

/**
 * Home page component showing main app features and call-to-actions
 * Displays hero section, features, how it works, and final CTA
 */
const Home: React.FC<HomeProps> = ({ isFirstTimeLogin = false }) => {
  const { toast } = useToast();

  // Show welcome message for first-time users
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userRole = localStorage.getItem("userRole");

    if (isFirstTimeLogin && isLoggedIn === "true") {
      if (userRole === "admin") {
        toast({
          title: "Welcome, Admin!",
          description: "You now have access to all admin features.",
        });
      } else {
        toast({
          title: "Welcome to Football Pitch Booking!",
          description: "You can now book pitches and join games.",
        });
      }
    }
  }, [toast, isFirstTimeLogin]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center bg-[url('/images/bgHomePage.PNG')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Your Game Just A <span className="text-bokit-400">Click Away</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-200">
            Find and reserve the best football pitches in your area, connect
            with players, and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-bokit-500 hover:bg-bokit-600"
            >
              <Link to="/pitches">Find Pitches</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-black hover:bg-white/10"
            >
              <Link to="/reservations">View Reservations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-[#0F766E]" />}
              title="Easy Booking"
              description="Book football pitches in just a few clicks. View availability in real-time and secure your spot instantly."
            />
            <FeatureCard
              icon={<MapPin className="h-10 w-10 text-[#0F766E]" />}
              title="Find Nearby Pitches"
              description="Discover the best football pitches in your area with detailed information and photos."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-[#0F766E]" />}
              title="Join Games"
              description="Looking for a game? Join existing reservations and connect with other players in your area."
            />
            <FeatureCard
              icon={<Star className="h-10 w-10 text-[#0F766E]" />}
              title="Profile"
              description="Show and edit your profile using our profile personalization system"
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-[#0F766E]" />}
              title="Payments"
              description="Pay for your bookings. Our admin team handles all payment processing."
            />
            <FeatureCard
              icon={<Trophy className="h-10 w-10 text-[#0F766E]" />}
              title="Leaderboards"
              description="Track your stats, compare with friends, and climb the leaderboard rankings."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number={1}
              title="Find a Pitch"
              description="Browse through our selection of football pitches and find the perfect one for your game."
            />
            <StepCard
              number={2}
              title="Book Your Slot"
              description="Select your preferred date and time, and book your pitch with just a few clicks."
            />
            <StepCard
              number={3}
              title="Play & Enjoy"
              description="Show up, meet with the admin, play your game, and track your stats on the leaderboard!"
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-[#0F766E] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Play?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of football enthusiasts who are using BOKIT to find
            and book pitches.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-[#0F766E] hover:bg-gray-100"
          >
            <Link to="/pitches">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

/**
 * Feature card component for displaying service features
 */
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

/**
 * Step card component for displaying how-it-works steps
 */
const StepCard: React.FC<{
  number: number;
  title: string;
  description: string;
}> = ({ number, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-[#0F766E] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default Home;
