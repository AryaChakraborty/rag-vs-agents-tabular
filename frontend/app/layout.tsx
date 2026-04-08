import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RAG vs AI Agents",
  description: "Why agents beat retrieval for structured data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
