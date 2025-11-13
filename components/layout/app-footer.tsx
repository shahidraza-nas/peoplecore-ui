import { Users, MessageSquare } from "lucide-react";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-24 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 rounded-xl">
                <Users className="w-5 h-5 text-zinc-50 dark:text-zinc-900" />
              </div>
              <span className="text-lg font-bold">PeopleCore</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Connect, collaborate, and stay organized with your team.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><Link href="/features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</Link></li>
              <li><Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} PeopleCore. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </a>
            <a href="#" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <Users className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
