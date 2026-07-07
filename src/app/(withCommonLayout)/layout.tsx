import Footer from "@/src/components/shared/Footer";
import Subscription from "@/src/components/shared/Subscription";
import React from "react";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <main>{children}</main>
      <Subscription></Subscription>
      <Footer></Footer>
    </div>
  );
}
