import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BikeKundli",
  description:
    "Know your bike before the mechanic does: known issues, service checkpoints, and repair-cost bands for 300cc+ motorcycles in India — free to browse, with opt-in bike tracking."
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
