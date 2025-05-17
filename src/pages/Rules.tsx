// src/pages/Rules.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Handshake, Clock, ShieldCheck, Ban } from "lucide-react";

const Rules = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="text-4xl mb-4">⚽</div>
        <h1 className="text-3xl font-bold">Rules & Guidelines</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Please follow these rules to ensure fair and safe play.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="py-4 flex items-start gap-4">
            <Handshake className="w-6 h-6 text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">Respect Others</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Players must treat each other with respect and refrain from
                unsportsmanlike behavior.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 flex items-start gap-4">
            <Clock className="w-6 h-6 text-yellow-500 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">Punctuality</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Arrive at the pitch 10 minutes before your booking time.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-green-500 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">Safety</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Use proper gear and follow instructions to avoid injury.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 flex items-start gap-4">
            <Ban className="w-6 h-6 text-red-500 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">Cancellation Policy</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Players must cancel their reservation at least{" "}
                <strong>2 hours</strong> before the game start time. Failure to
                show up without cancellation may result in a temporary ban from
                future bookings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Rules;
