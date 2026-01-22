import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import OnboardingModal from "@/components/OnboardingModal";

export const metadata: Metadata = {
  title: "Portable AI Memory Kit",
  description: "Local-first memory pack for AI assistants"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 bg-mist px-4 py-6 md:px-8">
            {children}
          </main>
        </div>
        <OnboardingModal />
      </body>
    </html>
  );
}
