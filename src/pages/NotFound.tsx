
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-bokit-500 dark:text-bokit-400">404</h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 mt-4 mb-6">
          Oops! This page went out of bounds.
        </p>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="bg-bokit-500 hover:bg-bokit-600">
          <Link to="/" className="inline-flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
