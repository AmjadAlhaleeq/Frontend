
// src/pages/FAQ.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Helmet } from "react-helmet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is BOKIT?",
    answer: "BOKIT is an online platform that allows players to book football pitches, track their performance, and connect with other players. It supports features like leaderboards, badges, and match highlights."
  },
  {
    question: "How do I book a football pitch?",
    answer: "You can browse available pitches on the Pitches page, select your preferred pitch, and click on 'Upcoming Reservations' to see available time slots. Choose a date and time slot, select your preferred position, and confirm your booking."
  },
  {
    question: "Can I cancel my reservation?",
    answer: "Yes, you can cancel your reservation from the Reservations page. Navigate to the 'Upcoming Games' tab, find your reservation, and click the 'Cancel Reservation' button. A confirmation dialog will appear before finalizing the cancellation."
  },
  {
    question: "How are match highlights recorded?",
    answer: "Match highlights (goals, assists, yellow/red cards) are recorded by the match admin during and after the game. These highlights appear in the game details and contribute to players' statistics on the leaderboards."
  },
  {
    question: "How is the leaderboard calculated?",
    answer: "The leaderboard ranks players based on their overall performance, including goals scored, assists, games played, and win ratio. Players earn points for each goal, assist, and victory, which determines their position in the rankings."
  },
  {
    question: "Can I select my preferred position when joining a game?",
    answer: "Yes, when you join a game, you can select your preferred position on the field. This helps organize the teams and ensures a balanced distribution of players across different positions."
  },
  {
    question: "What happens if a game is fully booked?",
    answer: "If a game is fully booked, you can join the waiting list. You'll be notified if a spot becomes available due to cancellations. Alternatively, you can browse other available time slots or pitches."
  }
];

const Faq = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Helmet>
        <title>FAQ | BOKIT</title>
      </Helmet>

      <div className="text-center mb-10">
        <div className="text-4xl mb-4">❓</div>
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Find answers to common questions about BOKIT
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 text-gray-600 dark:text-gray-400">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Faq;
