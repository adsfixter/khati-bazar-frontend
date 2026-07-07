// src/components/Dashboard/ProfileHeader.tsx
import React from "react";
import { UserProfile } from "@/src/types/dashboard";

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 4H4L5 2H9L10 4H13V12H1V4Z"
      stroke="white"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <circle cx="7" cy="8" r="2.3" stroke="white" strokeWidth="1.3" />
  </svg>
);

const ProfileHeader: React.FC<{ user: UserProfile }> = ({ user }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E9E9E9] bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#37651B] text-[20px] font-semibold text-white">
          {user.avatarLetter}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-semibold text-[#1E1E1E]">{user.name}</h2>
            {user.isActive && (
              <span className="flex items-center gap-1 text-[12px] text-[#37651B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#37651B]" />
                Active
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-[#6B6B6B]">
            {user.phone} &nbsp;&middot;&nbsp; {user.email}
          </p>
          <p className="mt-0.5 text-[12px] text-[#9A9A9A]">Member since {user.memberSince}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 rounded-lg border border-[#E9E9E9] px-3 py-2 text-[13px] font-medium text-[#1E1E1E]">
          <EditIcon />
          Edit Profile
        </button>
        <button className="flex items-center gap-1.5 rounded-lg bg-[#37651B] px-3 py-2 text-[13px] font-medium text-white">
          <CameraIcon />
          Change Photo
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;