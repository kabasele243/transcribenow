import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReduxProvider from "@/components/ReduxProvider";
import ClerkAuthProvider from "@/components/ClerkAuthProvider";
import QueryProvider from "@/components/QueryProvider";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TranscribeNow - Convert Audio to Text",
  description: "Upload your audio files and get accurate transcriptions in minutes. Supports multiple file formats and languages.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ReduxProvider>
            <QueryProvider>
              <ClerkAuthProvider>
                <Header />
                {children}
                <Footer />
              </ClerkAuthProvider>
            </QueryProvider>
          </ReduxProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
