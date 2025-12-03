import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MovieShow - AI-Powered Movie Recommendations",
  description: "Discover your next favorite movie with our advanced AI recommendation engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
