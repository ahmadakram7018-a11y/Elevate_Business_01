import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ComposeProvider } from "@/context/ComposeContext";
import Chatbot from "@/components/Chatbot";
import ComposeManager from "@/components/ComposeManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elevate Business",
  description: "Scale your business with AI-powered email intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <ComposeProvider>
              {children}
              <Chatbot />
              <ComposeManager />
            </ComposeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
