// src/components/Dashboard/RecentOrders.tsx
import React from "react";
import { OrderRow } from "@/src/types/dashboard";

const EyeIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 6C1 6 3.5 1 8 1C12.5 1 15 6 15 6C15 6 12.5 11 8 11C3.5 11 1 6 1 6Z"
      stroke="#6B6B6B"
      strokeWidth="1.3"
    />
    <circle cx="8" cy="6" r="2" stroke="#6B6B6B" strokeWidth="1.3" />
  </svg>
);

const statusStyle: Record<OrderRow["status"], string> = {
  Delivered: "bg-[#EBF0E8] text-[#37651B]",
  Processing: "bg-[#FFF6E5] text-[#C98B1F]",
  Canceled: "bg-[#FBEAEA] text-[#D14343]",
};

const RecentOrders: React.FC<{ orders: OrderRow[] }> = ({ orders }) => {
  return (
    <div className="rounded-xl border border-[#E9E9E9] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#1E1E1E]">Recent Orders</h3>
        <button className="flex items-center gap-1 text-[13px] font-medium text-[#37651B]">
          View All
          <span>&rarr;</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-[13px]">
          <thead>
            <tr className="text-[#6B6B6B]">
              <th className="py-2 font-medium">Order ID</th>
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Items</th>
              <th className="py-2 font-medium">Amount</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-[#F0F0F0]">
                <td className="py-3 font-medium text-[#1E1E1E]">{order.id}</td>
                <td className="py-3 text-[#6B6B6B]">{order.date}</td>
                <td className="py-3 text-[#6B6B6B]">{order.items} items</td>
                <td className="py-3 font-medium text-[#1E1E1E]">৳{order.amount}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3">
                  <button className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E9E9E9]">
                    <EyeIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;