// src/components/Dashboard/AccountSecurity.tsx
import React from "react";

interface SecurityItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
}

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#37651B" strokeWidth="1.3" />
    <path d="M5 7V4.5C5 2.6 6.3 1 8 1C9.7 1 11 2.6 11 4.5V7" stroke="#37651B" strokeWidth="1.3" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 1L14 3V8C14 12 11 15.5 8 17C5 15.5 2 12 2 8V3L8 1Z"
      stroke="#37651B"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="#37651B" strokeWidth="1.3" />
    <path d="M8 4.5V8L10.5 9.5" stroke="#37651B" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const items: SecurityItem[] = [
  { icon: <LockIcon />, title: "Change Password", subtitle: "Last changed 3 months ago", actionLabel: "Update" },
  { icon: <ShieldIcon />, title: "Two-Factor Auth", subtitle: "Not enabled — add extra security", actionLabel: "Enable" },
  { icon: <ClockIcon />, title: "Login Activity", subtitle: "2 active sessions", actionLabel: "Review" },
];

const AccountSecurity: React.FC = () => {
  return (
    <div className="rounded-xl border border-[#E9E9E9] bg-white p-5">
      <h3 className="mb-3 text-[16px] font-semibold text-[#1E1E1E]">Account Security</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-lg border border-[#E9E9E9] p-4">
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EBF0E8]">
              {item.icon}
            </span>
            <p className="text-[13px] font-medium text-[#1E1E1E]">{item.title}</p>
            <p className="mb-2 text-[12px] text-[#9A9A9A]">{item.subtitle}</p>
            <button className="flex items-center gap-1 text-[13px] font-medium text-[#37651B]">
              {item.actionLabel}
              <span>&rarr;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountSecurity;