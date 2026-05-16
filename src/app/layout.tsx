import type { Metadata } from "next";
import { Luckiest_Guy, Kalam, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const luckiestGuy = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-luckiest-guy",
});

const kalam = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kalam",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SamplesWala Dashboard",
  description: "Artist Portal for SamplesWala",
};

export default function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/Favicon.ico" sizes="any" />
      </head>
      <body
        className={`${luckiestGuy.variable} ${kalam.variable} ${jetbrainsMono.variable} antialiased bg-black text-white selection:bg-studio-neon selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}

