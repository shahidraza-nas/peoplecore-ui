"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-stone-100 to-zinc-200 dark:from-zinc-900 dark:via-neutral-900 dark:to-black text-zinc-900 dark:text-zinc-100">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Introduction</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                At PeopleCore, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you use our platform.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Information We Collect</h2>
              <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <p><strong className="text-zinc-900 dark:text-zinc-100">Personal Information:</strong> Name, email address, phone number, and profile information you provide.</p>
                <p><strong className="text-zinc-900 dark:text-zinc-100">Usage Data:</strong> Information about how you interact with our platform, including chat messages and activity logs.</p>
                <p><strong className="text-zinc-900 dark:text-zinc-100">Technical Data:</strong> IP address, browser type, device information, and cookies.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">How We Use Your Information</h2>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Data Security</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                We use industry-standard security measures to protect your data, including encryption, secure 
                authentication, and regular security audits. However, no method of transmission over the Internet 
                or electronic storage is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Your Rights</h2>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                <li>Access, update, or delete your personal information</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:privacy@peoplecore.com" className="text-zinc-900 dark:text-zinc-100 hover:underline">
                  privacy@peoplecore.com
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
