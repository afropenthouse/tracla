import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import GlobalLoader from "@/components/common/GlobalLoader";
import Toast from "@/components/common/Toast";
import PaymentModal from "@/components/modals/PaymentModal";
import PaymentModalTrigger from "@/components/PaymentModalTrigger";
import TrialModal from "@/components/modals/TrialModal";
import ForgotPasswordModal from "@/components/modals/ForgotPasswordModal";
import CustomerDetailsModal from "@/components/modals/CustomerDetailsModal";
import SubscriptionDebugPanel from "@/components/dev/SubscriptionDebugPanel";  

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
          <PaymentModal />
          <TrialModal />
          <PaymentModalTrigger />
          <ForgotPasswordModal />
          <CustomerDetailsModal />
          <SubscriptionDebugPanel />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
