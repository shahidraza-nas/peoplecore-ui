"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-stone-100 to-zinc-200 dark:from-zinc-900 dark:via-neutral-900 dark:to-black text-zinc-900 dark:text-zinc-100">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Agreement to Terms</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                By accessing or using PeopleCore, you agree to be bound by these Terms of Service and all applicable 
                laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Use License</h2>
              <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <p>Permission is granted to temporarily use PeopleCore for personal or commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose without proper subscription</li>
                  <li>Attempt to reverse engineer any software contained on PeopleCore</li>
                  <li>Remove any copyright or proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">User Accounts</h2>
              <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Maintaining the confidentiality of your account and password</li>
                  <li>Restricting access to your computer and account</li>
                  <li>All activities that occur under your account</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Acceptable Use</h2>
              <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <p>You agree not to use PeopleCore to:</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful code or malware</li>
                  <li>Harass, abuse, or harm another person</li>
                  <li>Spam or send unsolicited messages</li>
                  <li>Impersonate any person or entity</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Termination</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
                including if you breach these Terms. Upon termination, your right to use the service will immediately cease.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Limitation of Liability</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                In no event shall PeopleCore or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                to use PeopleCore.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Changes to Terms</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                We reserve the right to modify these terms at any time. We will notify users of any changes by updating 
                the "Last updated" date at the top of this page. Your continued use of PeopleCore after any changes 
                constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Contact Information</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                For questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:legal@peoplecore.com" className="text-zinc-900 dark:text-zinc-100 hover:underline">
                  legal@peoplecore.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
