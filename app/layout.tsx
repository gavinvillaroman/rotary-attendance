import type { Metadata } from "next";
import "./globals.css";
import { TabBar } from "@/components/TabBar";

export const metadata: Metadata = {
  title: "Rotary Attendance",
  description: "Attendance tracker for Rotary meetings",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <TabBar />
        <main className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-6 sm:pt-8">
          {children}
        </main>
      </body>
    </html>
  );
}
