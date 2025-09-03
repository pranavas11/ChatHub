import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jupyter - AI Research Assistant",
  description: "Juputer is an AI powered research assistant that answers queries based on factual data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en">
      <body className={`${inter.className} h-full`}>
        <Sidebar>{children}</Sidebar>
      </body>
    </html>
  );
}