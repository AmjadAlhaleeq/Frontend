import React from "react";
import { Helmet } from "react-helmet";
import {
  BadgeCheck,
  Calendar,
  MapPin,
  Shield,
  Star,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Helmet>
        <title>About Us | BOKIT</title>
      </Helmet>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About BOKIT</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your digital gateway to football pitches, player statistics, and
          performance tracking.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[#0F766E]">
            Our Mission
          </h2>
          <p className="text-gray-600 mb-4">
            BOKIT was founded with a simple yet powerful mission: to make
            booking football pitches effortless and to enhance the amateur
            football experience through technology.
          </p>
          <p className="text-gray-600">
            We believe that everyone should have easy access to quality football
            facilities and the ability to track their performance and progress
            in the sport they love.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
            alt="Football pitch"
            className="w-full h-auto"
          />
        </div>
      </div>

      <Separator className="my-12" />

      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8 text-[#0F766E]">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Calendar className="h-8 w-8 text-[#0F766E]" />}
            title="Easy Booking"
            description="Find and reserve football pitches in your area with just a few clicks."
          />
          <FeatureCard
            icon={<Star className="h-8 w-8 text-[#0F766E]" />}
            title="Performance Stats"
            description="Track your goals, assists, and other key performance metrics over time."
          />
          <FeatureCard
            icon={<UserPlus className="h-8 w-8 text-[#0F766E]" />}
            title="Team Management"
            description="Create teams, invite friends, and organize matches with ease."
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-[#0F766E]" />}
            title="Leaderboards"
            description="Compete with other players and see where you rank in various categories."
          />
          <FeatureCard
            icon={<Badge className="h-8 w-8 text-[#0F766E]" />}
            title="Achievement System"
            description="Earn badges and recognition for your on-field accomplishments."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-[#0F766E]" />}
            title="Payments"
            description="Pay for your bookings. Our admin team handles all payment processing."
          />
        </div>
      </div>

      <Separator className="my-12" />

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
            alt="Football team"
            className="w-full h-auto"
          />
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-2xl font-semibold mb-4 text-[#0F766E]">
            Player Development Hub
          </h2>
          <p className="text-gray-600 mb-4">
            BOKIT isn't just about booking pitches. We've created a
            comprehensive platform for player development, featuring:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <BadgeCheck className="h-5 w-5 text-[#0F766E] mr-2 mt-0.5" />
              <span>
                Detailed performance analytics and improvement suggestions
              </span>
            </li>
            <li className="flex items-start">
              <BadgeCheck className="h-5 w-5 text-[#0F766E] mr-2 mt-0.5" />
              <span>Personalized training programs based on your stats</span>
            </li>
            <li className="flex items-start">
              <BadgeCheck className="h-5 w-5 text-[#0F766E] mr-2 mt-0.5" />
              <span>Video analysis tools for reviewing your games</span>
            </li>
            <li className="flex items-start">
              <BadgeCheck className="h-5 w-5 text-[#0F766E] mr-2 mt-0.5" />
              <span>Expert coaching tips from professional players</span>
            </li>
          </ul>
        </div>
      </div>

      <Separator className="my-12" />

      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-[#0F766E]">Our Team</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          BOKIT was created by a team of football enthusiasts and technology
          experts who understand both the beautiful game and the power of
          digital innovation.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <TeamMemberCard
            name="Mohammed Alassi"
            role="Backend Developer"
            image="/BOKIT-Upload/2e0ce39d-1fbe-42e1-b487-c8b0cf101a8c.png"
            description="Responsible for all backend development, including setting up the server, creating APIs, handling database operations, and ensuring secure and efficient data flow."
          />
          <TeamMemberCard
            name="Osama Abbadi"
            role="Frontend Developer & UI/UX Designer"
            image="/BOKIT-Upload/11003c1a-89df-4858-9bfb-b0340362cd87.png"
            description="Focuses on designing the user interface and enhancing user experience. Works on implementing layouts, managing local storage, and connecting the frontend to backend services."
          />
          <TeamMemberCard
            name="Amjad Alhalleeq"
            role="Frontend Developer "
            image="/BOKIT-Upload/801c7456-11c0-4592-88c8-1c7ff69fdde6.png"
            description="Handles development of interactive and reusable UI components. Works closely with Osama to integrate frontend logic with backend APIs, ensuring smooth data interaction."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow bg-white">
    <CardContent className="p-6">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-[#0F766E]/10 rounded-full mb-4">{icon}</div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const TeamMemberCard = ({ name, role, image, description }) => (
  <div className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
    <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full border-4 border-[#0F766E]/20">
      <img src={image} alt={name} className="w-full h-full object-cover" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
    <p className="text-[#0F766E] font-medium mb-3">{role}</p>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const Badge = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

export default AboutPage;
