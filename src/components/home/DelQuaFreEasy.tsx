import React from 'react';
import Image, { StaticImageData } from 'next/image';
import delivery from "../../../public/img/delivery.png";
import fress from "../../../public/img/fresh.png";
import quality from "../../../public/img/quality.png";
import retur from "../../../public/img/return.png";

interface FeatureCard {
  id: number;
 image: StaticImageData;
  title: string;
  subtitle: string;
  alt: string;
}

const DelQuaFreEasy = () => {
  const features: FeatureCard[] = [
    {
      id: 1,
      image: delivery,
      title: "Same Day Delivery",
      subtitle: "Order before 11 AM",
      alt: "Delivery Truck"
    },
    {
      id: 2,
      image: fress,
      title: "100% Fresh & Natural",
      subtitle: "Quality guaranteed",
      alt: "100% Organic"
    },
    {
      id: 3,
      image: quality,
      title: "Quality Guaranteed",
      subtitle: "Premium products",
      alt: "Quality Ribbon"
    },
    {
      id: 4,
      image: retur,
      title: "Easy Returns",
      subtitle: "7 days return policy",
      alt: "Easy Return Box"
    }
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 my-10">
      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] justify-items-center">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="w-full max-w-[308px] h-[147px] bg-[#EBF0E8] border border-[#C1CFB8] rounded-[12px] p-[16px] flex flex-col items-center justify-center gap-[12px] transition-all duration-200 hover:shadow-md"
          >
            {/* Feature Icon Image Area */}
            <div className="h-[40px] flex items-center justify-center">
              <Image 
                src={feature.image} 
                alt={feature.alt} 
                height={40}
                className="object-contain max-h-[40px] w-auto"
                priority
              />
            </div>

            {/* Typography Content */}
            <div className="text-center flex flex-col">
              <p className="body-large-semibold text-[#0E2038]">
                {feature.title}
              </p>
              <p className="subtext-large-regular text-[#7F8482] mt-1">
                {feature.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DelQuaFreEasy;