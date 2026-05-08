import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "350x Garage",
  description: "Rider intelligence and bike health logging for 350cc+ motorcycles in India."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
