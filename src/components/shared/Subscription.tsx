import React from 'react';

const Subscription = () => {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-0 my-8">
      <div className="bg-[#37651B] rounded-[12px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 min-h-[106px]">
        
        {/* Left Side: Heading Text */}
        <h3 className="text-[#FFFFFF]  title-medium">
          Get the best offers in your inbox
        </h3>

        {/* Right Side: Input and Button Wrapper */}
        <div className="w-full md:w-auto flex items-center bg-white rounded-[8px] pl-4 border border-gray-100 max-w-md md:min-w-[420px]">
          {/* Email SVG Icon */}
          <div className="flex-shrink-0 mr-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 💡 এখানে strokeWidth এবং strokeLinejoin ফিক্স করা হয়েছে */}
              <path 
                d="M2.5 10C2.5 8.83836 2.5 8.25754 2.59607 7.77455C2.99061 5.7911 4.5411 4.24061 6.52455 3.84607C7.00754 3.75 7.58836 3.75 8.75 3.75H11.25C12.4116 3.75 12.9925 3.75 13.4755 3.84607C15.4589 4.24061 17.0094 5.7911 17.4039 7.77455C17.5 8.25754 17.5 8.83836 17.5 10C17.5 11.1616 17.5 11.7425 17.4039 12.2255C17.0094 14.2089 15.4589 15.7594 13.4755 16.1539C12.9925 16.25 12.4116 16.25 11.25 16.25H8.75C7.58836 16.25 7.00754 16.25 6.52455 16.1539C4.5411 15.7594 2.99061 14.2089 2.59607 12.2255C2.5 11.7425 2.5 11.1616 2.5 10Z" 
                stroke="#7F8482" 
                strokeWidth="1.5" 
                strokeLinejoin="round"
              />
              <path 
                d="M2.5 6.66675L4.47479 8.20262C6.82441 10.03 7.99922 10.9437 9.3412 11.1222C9.77869 11.1803 10.222 11.1803 10.6594 11.1221C12.0014 10.9436 13.1762 10.0299 15.5257 8.20237L17.5 6.66675" 
                stroke="#7F8482" 
                strokeWidth="1.5" 
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Input Field */}
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full bg-transparent body-sm-regular placeholder-[#7F8482] tracking-[-0.01em] leading-[150%] focus:outline-none py-2 pr-2"
          />

          {/* Subscribe Button */}
          <button className="bg-[#0E2038] text-white text-[16px] font-medium font-montserrat px-5 py-[10px] rounded-[8px] transition-all hover:bg-[#1a3354] active:scale-95 flex-shrink-0 h-[42vpx] flex items-center justify-center">
            Subscribe
          </button>
        </div>

      </div>
    </div>
  );
};

export default Subscription;