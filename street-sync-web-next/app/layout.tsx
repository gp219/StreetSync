import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreetSync",
  description: "Real-time city reporting and tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
