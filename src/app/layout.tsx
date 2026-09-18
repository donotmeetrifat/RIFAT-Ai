import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rifat | Personal Portfolio & RIFAT Ai",
  description: "Personal portfolio of Rifat featuring RIFAT Ai — a digital personal representative powered by Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#08090f] text-[#eef0f8]">
        {children}
      </body>
    </html>
  );
}
