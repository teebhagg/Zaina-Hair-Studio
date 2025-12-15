import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zainab's Hair Studio",
  description: "Professional hair salon services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
