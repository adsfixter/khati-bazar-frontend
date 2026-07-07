// src/components/Dashboard/NotificationsPanel.tsx
import React from "react";
import { NotificationItem } from "@/src/types/dashboard";

const iconByType: Record<NotificationItem["type"], string> = {
  info: "📦",
  promo: "%",
  success: "✔",
  warning: "🏆",
};

const NotificationsPanel: React.FC<{ notifications: NotificationItem[] }> = ({ notifications }) => {
  return (
    <div className="rounded-xl border border-[#E9E9E9] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#1E1E1E]">Notifications</h3>
        <button className="flex items-center gap-1 text-[13px] font-medium text-[#37651B]">
          See all
          <span>&rarr;</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#EBF0E8] text-[13px]">
              {iconByType[n.type]}
            </span>
            <div>
              <p className="text-[13px] text-[#1E1E1E]">{n.message}</p>
              <p className="text-[11px] text-[#9A9A9A]">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel;