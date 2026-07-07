"use client";
import React, { useState, useEffect } from "react";

interface CountdownProps {
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
}

const Countdown: React.FC<CountdownProps> = ({
  initialHours = 2,
  initialMinutes = 34,
  initialSeconds = 56,
}) => {
  const [time, setTime] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
          return prev;
        }
        let s = prev.seconds - 1;
        let m = prev.minutes;
        let h = prev.hours;

        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        return { hours: h, minutes: m, seconds: s };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => String(num).padStart(2, "0");

  return (
    <span className="text-[#FF9900] font-medium text-[14px] sm:text-[16px] flex items-center gap-1">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="inline"
      >
        <path
          d="M8 14.6666C11.6819 14.6666 14.6667 11.6819 14.6667 7.99992C14.6667 4.31792 11.6819 1.33325 8 1.33325C4.3181 1.33325 1.33334 4.31792 1.33334 7.99992C1.33334 11.6819 4.3181 14.6666 8 14.6666Z"
          stroke="#FF9900"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 4V8L10.6667 9.33333"
          stroke="#FF9900"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Ends in {format(time.hours)}:{format(time.minutes)}:{format(time.seconds)}
    </span>
  );
};

export default Countdown;