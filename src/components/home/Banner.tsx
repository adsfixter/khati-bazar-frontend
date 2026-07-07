// Banner.tsx
import React from "react";
import bannerbg from "../../../public/img/bannerbg.png";
import Image from "next/image";
import Categories from "../shared/Categories";
import Link from "next/link";
const bannerUrl = "/img/Banner.png";

interface Feature {
  title: string;
  subtitle: string;
}

const features: Feature[] = [
  { title: "100% Fresh", subtitle: "Natural & Healthy" },
  { title: "Fast Delivery", subtitle: "Same day deilvery" },
  { title: "Best Quality", subtitle: "Quality guaranteed" },
];

const FeatureIcon: React.FC = () => (
  <svg
    width="20"
    height="21"
    viewBox="0 0 20 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.0498 10.2722L7.88362 11.384C8.15535 11.7463 8.29121 11.9274 8.47274 11.9672C8.53083 11.9799 8.59072 11.9822 8.64961 11.9738C8.83362 11.9479 8.98273 11.7774 9.28094 11.4366L12.0498 8.27222M9.5498 19.2722C14.0963 19.2722 16.9345 14.2232 18.0643 8.89511C18.3275 7.65423 18.459 7.03379 18.2395 6.3003C18.1753 6.08563 18.0529 5.80842 17.9376 5.6163C17.5435 4.95988 16.9063 4.58622 15.632 3.83891L12.2814 1.87409C11.1005 1.18155 10.51 0.835279 9.86743 0.766864C9.65628 0.744382 9.44333 0.744382 9.23218 0.766864C8.58964 0.835279 7.99915 1.18155 6.81818 1.8741L3.46765 3.83891C2.19329 4.58622 1.55611 4.95988 1.16203 5.6163C1.0467 5.80842 0.92432 6.08563 0.860075 6.3003C0.64056 7.03379 0.77213 7.65423 1.03527 8.89511C2.16514 14.2232 5.00331 19.2722 9.5498 19.2722Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Banner: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <div className="mt-1">
        <Categories></Categories>
      </div>

      <div
        className="relative flex w-full items-center overflow-hidden rounded-2xl bg-[#1E380F] bg-cover bg-center bg-no-repeat h-[380px] sm:h-[420px] md:h-[500px]"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      >
        {/* Background Overlay Image with exact opacity/position responsive styling */}
        <div className="absolute inset-0 z-0 w-full max-w-[700px] md:w-[700px] opacity-40 md:opacity-100 pointer-events-none">
          <Image
            src={bannerbg}
            alt="Fresh vegetables and fruits basket"
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover md:object-fill"
          />
        </div>

        {/* Content Container */}
        <div className="w-full absolute z-10 px-5 py-6 text-white sm:px-8 sm:py-10 md:w-[60%] lg:w-1/2 md:px-12 md:py-14">
          <h1 className="font-['Montserrat_Alternates'] text-[24px] sm:text-[36px] md:text-[56px] font-semibold leading-[120%] md:leading-[140%] tracking-[-0.03em]">
            Fresh vegetables
            <br />
            Fruits & groceries
          </h1>

          <p className="mb-4 md:mb-8 font-['Montserrat_Alternates'] text-[18px] sm:text-[26px] md:text-[44px] font-medium italic leading-[140%] tracking-[-0.03em] text-[#C7D6BA]">
            delivered daily
          </p>

          {/* Features list wrapping safely */}
          <div className="mb-6 md:mb-8 flex flex-wrap gap-x-4 gap-y-3 md:gap-2">
            {features.map((f) => (
              <div
                className="flex items-center gap-2.5 flex-shrink-0"
                key={f.title}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/40">
                  <FeatureIcon />
                </span>
                <div>
                  <p className="body-large-medium text-[14px] sm:text-[16px]">
                    {f.title}
                  </p>
                  <p className="subtext-medium text-[12px] sm:text-[14px] text-white/80">
                    {f.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons with adaptive mobile width */}
          <div className="flex flex-row flex-wrap gap-3 sm:gap-4">
            <Link href="shopnow">
              <button className="flex h-[42px] w-[130px] sm:w-[150px] items-center justify-center gap-2 rounded-lg bg-[var(--Color-Primary-bg-500,#37651B)] px-4 py-2.5 text-[14px] sm:text-[15px] text-white hover:opacity-90 transition-all">
                Shop Now
                <span>&rarr;</span>
              </button>
            </Link>
            <button className="flex h-[42px] w-[170px] sm:w-[213px] items-center justify-center gap-2 rounded-lg border border-[var(--Color-stroke,#E9E9E9)] px-4 py-2.5 text-[14px] sm:text-[15px] text-white hover:bg-white/10 transition-all">
              Browse categories
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
