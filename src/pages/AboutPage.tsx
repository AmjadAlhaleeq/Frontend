import { CalendarCheck, Users, BarChart3, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-center mb-2">
        About <span className="text-teal-600">BOKIT</span>
      </h1>
      <p className="text-center text-gray-600 text-lg mb-10">
        Your ultimate football companion
      </p>

      <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-6 mb-12 border border-gray-200 dark:border-gray-800">
        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed space-y-2">
          We started BOKIT with a simple goal: make pitch booking easier and
          football more rewarding for everyone. Whether you’re organizing a
          weekly match with friends or chasing greatness on the pitch, BOKIT is
          built to support you every step of the way.
        </p>
        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mt-4">
          Our platform is more than just a reservation system. It’s a community
          hub for players to connect, compete, and grow. With features like
          player profiles, match history, achievements, and monthly
          leaderboards, we give every player the spotlight they deserve. From
          clean sheets to hat-tricks, your milestones are tracked, celebrated,
          and shared.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="pt-6 flex flex-col items-center">
            <CalendarCheck className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Easy Booking</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Find pitches, check availability, and lock in your game—all in a
              few taps.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6 flex flex-col items-center">
            <Users className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Community Hub</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Connect with other players, form teams, and grow together.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6 flex flex-col items-center">
            <BarChart3 className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Monitor your stats, earn achievements, and climb the ranks.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6 flex flex-col items-center">
            <Star className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">All Skill Levels</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              From casual players to rising stars, everyone’s welcome.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-lg text-gray-700 dark:text-gray-300 mb-4">
        We believe football should be accessible, competitive, and fun.
      </div>
      <div className="text-center text-base text-gray-600 dark:text-gray-400 mb-4">
        That’s why BOKIT is designed for players of all skill levels—from casual
        weekend warriors to rising local stars.
      </div>
      <div className="text-center text-teal-700 dark:text-teal-400 font-semibold text-base">
        This is where your football story begins.
      </div>
    </div>
  );
};

export default AboutPage;
