"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQPage() {
  const faqs = [
    {
      question: "What is PeopleCore?",
      answer: "PeopleCore is a modern employee management and communication platform designed to help teams stay connected and organized. It combines real-time chat, employee directory, and team management features in one intuitive interface."
    },
    {
      question: "How do I get started?",
      answer: "Simply register for an account, verify your email, and you can start adding team members and chatting right away. Our onboarding guide will walk you through the setup process."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We use industry-standard JWT authentication, encrypted connections (HTTPS), and follow best practices for data security. Your information is stored securely and never shared with third parties."
    },
    {
      question: "Can I use PeopleCore on mobile?",
      answer: "Yes! PeopleCore is fully responsive and works great on mobile devices. We're also working on native iOS and Android apps for an even better mobile experience."
    },
    {
      question: "What's included in the free plan?",
      answer: "The free plan includes up to 10 team members, basic chat functionality, employee directory, and email support. It's perfect for small teams getting started."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change your plan at any time from your account settings. Upgrades take effect immediately, and downgrades will apply at the end of your current billing cycle."
    },
    {
      question: "Do you offer a trial period?",
      answer: "The free plan serves as our trial - you can use it indefinitely with no credit card required. When you're ready for more features, you can upgrade to Pro or Enterprise."
    },
    {
      question: "How does real-time chat work?",
      answer: "Our chat uses WebSocket technology to deliver messages instantly. You'll see typing indicators, read receipts, and notifications for new messages in real-time."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, Pro and Enterprise plans include data export functionality. You can export your employee directory, chat history, and other data at any time."
    },
    {
      question: "What kind of support do you offer?",
      answer: "Free plans get email support, Pro plans get priority support, and Enterprise plans get 24/7 phone support with a dedicated account manager."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-stone-100 to-zinc-200 dark:from-zinc-900 dark:via-neutral-900 dark:to-black text-zinc-900 dark:text-zinc-100">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Find answers to common questions about PeopleCore
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-zinc-600 dark:text-zinc-400">
                  {faq.answer}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
