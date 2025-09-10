import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import GlobalLoader from "@/components/common/GlobalLoader";
import Toast from "@/components/common/Toast";  

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tracla | Make your top customers spend more",
  description: "Make your top customers spend more",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <GlobalLoader />
          <Toast />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
