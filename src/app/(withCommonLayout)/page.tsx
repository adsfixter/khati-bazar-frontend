import Banner from "@/src/components/home/Banner";
import DelQuaFreEasy from "@/src/components/home/DelQuaFreEasy";
import Faq from "@/src/components/home/Faq";
import FeatureProducts from "@/src/components/home/FeaturedProducts";
import FreshDeals from "@/src/components/home/FreshDeals";
import FreshPicks from "@/src/components/home/FreshPicks";
import ShopbyCategory from "@/src/components/home/ShopbyCategory";
import Deliveryslot from "@/src/components/Shopnow/Deliveryslot";
import React from "react";

const page = () => {
  return (
    <div>
      <Banner></Banner>
      <FreshDeals></FreshDeals>
      <ShopbyCategory></ShopbyCategory>
      <FeatureProducts></FeatureProducts>
      <FreshPicks></FreshPicks>
      <DelQuaFreEasy></DelQuaFreEasy>
      <Faq></Faq>     
    </div>
  );
};

export default page;
