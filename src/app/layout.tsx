import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat_Alternates } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css"; 
import Navbar from "../components/shared/Navbar";
import ReactQueryProvider from "@/src/providers/ReactQueryProvider"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat_Alternates({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Khati Bazar | Pure & Fresh Grocery Online Shop",
  description: "Shop 100% authentic, organic, and fresh groceries from Khati Bazar. Get fast and reliable home delivery at the best price.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        {/* 🎯 মেইন লেআউটে র্যাপ করা হলো */}
        <ReactQueryProvider>
          <Navbar />
          {children}
        </ReactQueryProvider>
         
      </body>
    </html>
  );
}