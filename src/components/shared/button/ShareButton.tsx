import React from "react";

interface ShareButtonProps {
  title: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title }) => {
  return (
    <button className="w-[156px] h-[40px] px-5 py-[10px] gap-[8px] rounded-[8px] bg-[#37651B] text-white flex items-center justify-center transition-all hover:bg-[#2c5216] active:scale-95 shadow-sm overflow-hidden subtext-large-medium">
      {/* Dynamic Text with Figma Typography */}
      <span className="font-montserrat font-medium text-[14px] leading-[140%] tracking-[-0.01em] truncate">
        {title}
      </span>
    </button>
  );
};

export default ShareButton;
