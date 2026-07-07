"use client";

import React from "react";
import Image from "next/image";
import fish from "../../../public/img/fish.png";
import vegitable from "../../../public/img/vegitable.png";
import chaldal from "../../../public/img/chaldal.png";
import Link from "next/link";

const FreshPicks = () => {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4">
      <h4 className="text-[#0E2038] h4 mb-6">Fresh Picks</h4>

      {/* Grid structure matching 3 cards with proper width matching limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {/* Card 1: Organic Vegetables */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #C1CFB8 0%, #EBF0E8 20%, #C1CFB8 40%, #EBF0E8 60%, #C1CFB8 80%, #C1CFB8 100%)",
          }}
          className="relative w-full max-w-[416px] h-[220px] rounded-[16px] p-6 flex flex-col justify-between overflow-visible group"
        >
          <div className="z-10 flex flex-col justify-between h-full items-start">
            <div>
              <h3 className="text-[#0E2038] title-medium font-semibold ">
                Organic Vegetables
              </h3>
              <p className="body-large-medium text-[#0E2038]/80 mt-1 font-medium">
                Up to 30% OFF
              </p>
            </div>
            <Link href="/shopnow">
              {" "}
              <button className="bg-[#3D5C22] hover:bg-[#2F471A] text-white body-medium font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors duration-200">
                Shop Now
                <svg
                  width="10"
                  height="9"
                  viewBox="0 0 10 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.75 4.08333H9.08333M5.75 7.41667L9.08333 4.08333L5.75 0.75"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Link>
          </div>
          {/* Absolute positioned image breaking boundary slightly if needed */}
          <div className="absolute right-0 bottom-0 w-[55%] h-[90%] pointer-events-none select-none">
            <Image
              src={vegitable}
              alt="Organic Vegetables"
              className="object-contain object-bottom w-full h-full transform group-hover:scale-105 transition-transform duration-300 origin-bottom"
              priority
            />
          </div>
        </div>

        {/* Card 2: Rice & Dal */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #F0E1A6 0%, #FFF8E0 20%, #EEEADE 40%, #FFF8E0 60%, #EEEADE 80%, #F0E1A6 100%)",
          }}
          className="relative w-full max-w-[416px] h-[220px] rounded-[16px] p-6 flex flex-col justify-between overflow-visible group"
        >
          <div className="z-10 flex flex-col justify-between h-full items-start">
            <div>
              <h3 className="text-[#0E2038] title-medium font-semibold ">
                Rice & Dal
              </h3>
              <p className="body-large-medium text-[#0E2038]/80 mt-1 font-medium">
                Fresh Stock
              </p>
            </div>
            <Link href="/shopnow">
              {" "}
              <button className="bg-[#3D5C22] hover:bg-[#2F471A] text-white body-medium font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors duration-200">
                Shop Now
                <svg
                  width="10"
                  height="9"
                  viewBox="0 0 10 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.75 4.08333H9.08333M5.75 7.41667L9.08333 4.08333L5.75 0.75"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 w-[55%] h-[90%] pointer-events-none select-none">
            <Image
              src={chaldal}
              alt="Rice and Dal"
              className="object-contain object-bottom w-full h-full transform group-hover:scale-105 transition-transform duration-300 origin-bottom"
              priority
            />
          </div>
        </div>

        {/* Card 3: Fish & Meat */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #D1E4F5 0%, #F1F8FF 20%, #D8E3EC 40%, #F1F8FF 60%, #D8E3EC 80%, #E1F1FE 100%)",
          }}
          className="relative w-full max-w-[416px] h-[220px] rounded-[16px] p-6 flex flex-col justify-between overflow-visible group"
        >
          <div className="z-10 flex flex-col justify-between h-full items-start">
            <div>
              <h3 className="text-[#0E2038] title-medium font-semibold ">
                Fish & Meat
              </h3>
              <p className="body-large-medium text-[#0E2038]/80 mt-1 font-medium">
                Daily Fresh
              </p>
            </div>
            <Link href="/shopnow">
              {" "}
              <button className="bg-[#3D5C22] hover:bg-[#2F471A] text-white body-medium font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors duration-200">
                Shop Now
                <svg
                  width="10"
                  height="9"
                  viewBox="0 0 10 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.75 4.08333H9.08333M5.75 7.41667L9.08333 4.08333L5.75 0.75"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 w-[55%] h-[90%] pointer-events-none select-none">
            <Image
              src={fish}
              alt="Fish and Meat"
              className="object-contain object-bottom w-full h-full transform group-hover:scale-105 transition-transform duration-300 origin-bottom"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreshPicks;
