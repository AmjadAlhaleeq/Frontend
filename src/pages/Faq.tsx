// src/pages/FAQ.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Helmet } from "react-helmet";

const faqs = Array(5).fill({
  question: "What is BOKIT?",
  answer:
    "BOKIT is an online platform that allows players to book football pitches, track their performance, and connect with other players. It also supports features like leaderboards, badges, and match highlights.",
});

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

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index}>
            <CardContent className="py-4">
              <h3 className="font-semibold text-lg">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Faq;
