import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard - Transcribe",
  description: "Manage your transcription projects and files.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className={inter.className}>
        {children}
      </div>
    </ProtectedRoute>
  );
} 