"use client"; // 🟢 ক্লায়েন্ট কম্পোনেন্ট

import React from "react";
import Link from "next/link";
import DashboardSidebar from "@/src/components/Dashboard/DashboardSidebar";
import { SessionProvider } from "next-auth/react"; 
import Subscription from "@/src/components/shared/Subscription";
import ReactQueryProvider from "@/src/providers/ReactQueryProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      {/* 🎯 এখানে আলাদা করে client পাস করার কোনো প্রয়োজন নেই */}
      <ReactQueryProvider>
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-[13px] text-[#6B6B6B]">
            <Link href="/">Home</Link>
            <span>&gt;</span>
            <span className="font-semibold text-[#1E1E1E]">Dashboard</span>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row min-h-screen">
            <DashboardSidebar />
            <div className="flex-1">{children}</div>
          </div>
          <Subscription />
        </div>
      </ReactQueryProvider>
    </SessionProvider>
  );
};

export default DashboardLayout;