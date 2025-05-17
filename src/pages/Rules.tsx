
import React from "react";
import { AlertCircle, CheckCircle, Clock, Users, X } from "lucide-react";
import { Helmet } from "react-helmet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Rules = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Helmet>
        <title>Rules | BOKIT</title>
      </Helmet>

      <div className="text-center mb-10">
        <div className="bg-[#0F766E]/10 p-4 rounded-full inline-block mb-4">
          <AlertCircle className="h-8 w-8 text-[#0F766E]" />
        </div>
        <h1 className="text-3xl font-bold">Platform Rules</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Guidelines for using BOKIT and participating in games
        </p>
      </div>

      <Alert className="mb-8 bg-amber-50 border-amber-200 text-amber-800">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Failure to follow these rules may result in suspension of your account. We aim to create a positive and fair environment for all players.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-[#0F766E]" />
            Booking & Reservation Rules
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                Booking Process
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <ul className="space-y-2 text-gray-700">
                  <RuleItem>Players can book a maximum of 2 games per week.</RuleItem>
                  <RuleItem>You cannot book multiple slots on the same day.</RuleItem>
                  <RuleItem>Reservations should be made at least 2 hours before the game start time.</RuleItem>
                  <RuleItem>Payment must be completed when making a reservation.</RuleItem>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                Cancellation Policy
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <ul className="space-y-2 text-gray-700">
                  <RuleItem>You can cancel your reservation up to 6 hours before the game without penalty.</RuleItem>
                  <RuleItem>Late cancellations (less than 6 hours before the game) will incur a 50% charge.</RuleItem>
                  <RuleItem>No-shows will be charged the full amount and may receive a penalty on their profile.</RuleItem>
                  <RuleItem>Three consecutive no-shows will result in a temporary booking suspension.</RuleItem>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-[#0F766E]" />
            Game Participation Rules
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-3" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                Before the Game
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <ul className="space-y-2 text-gray-700">
                  <RuleItem>Arrive at least 15 minutes before the scheduled start time.</RuleItem>
                  <RuleItem>Bring appropriate footwear (studs for grass, flat soles for indoor/artificial turf).</RuleItem>
                  <RuleItem>Wear distinguishable clothing (teams will be assigned colors before the game).</RuleItem>
                  <RuleItem>Inform the game admin if you're running late.</RuleItem>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                During the Game
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <ul className="space-y-2 text-gray-700">
                  <RuleItem>Play in a fair and respectful manner.</RuleItem>
                  <RuleItem>No aggressive behavior or serious foul play will be tolerated.</RuleItem>
                  <RuleItem>Follow the referee's or game admin's decisions without argument.</RuleItem>
                  <RuleItem>Report any injuries immediately to the game admin.</RuleItem>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                After the Game
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 pt-1">
                <ul className="space-y-2 text-gray-700">
                  <RuleItem>Help collect any equipment used during the game.</RuleItem>
                  <RuleItem>Report any issues with the facility to the game admin.</RuleItem>
                  <RuleItem>Participate in the post-game feedback and player ratings.</RuleItem>
                  <RuleItem>Leave the facility clean and tidy.</RuleItem>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-[#0F766E]" />
            Prohibited Behavior
          </h2>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="space-y-3 text-gray-800">
              <ProhibitedItem>Violent conduct or threatening behavior towards other players.</ProhibitedItem>
              <ProhibitedItem>Discriminatory language or actions of any kind.</ProhibitedItem>
              <ProhibitedItem>Deliberate damage to pitch facilities or equipment.</ProhibitedItem>
              <ProhibitedItem>Creating multiple accounts to circumvent rules or penalties.</ProhibitedItem>
              <ProhibitedItem>Sharing account access with others.</ProhibitedItem>
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>These rules are subject to change. Last updated: May 17, 2025</p>
      </div>
    </div>
  );
};

const RuleItem = ({ children }) => (
  <li className="flex items-start">
    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const ProhibitedItem = ({ children }) => (
  <li className="flex items-start">
    <X className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

export default Rules;
