import type { Metadata } from "next";
import { Orbitron, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bhibhushitams Security",
  description:
    "Cybersecurity internships, courses, certificates, jobs, and career support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${orbitron.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
