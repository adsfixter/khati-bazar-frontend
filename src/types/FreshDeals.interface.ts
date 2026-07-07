import axiosInstance from "../api/axiosInstance";
import { IProduct } from "./product.interface";

interface IFreshDealTimer {
  _id: string;
  title: string;
  status: "Active" | "Inactive";
  startDate: string;
  endDate: string;
}

interface FreshDealsResponse {
  success: boolean;
  message: string;
  data: {
    timer: IFreshDealTimer | null;
    products: IProduct[];
  };
}

export const getActiveFreshDealWithProducts = async (): Promise<{
  timer: IFreshDealTimer | null;
  products: IProduct[];
}> => {
  try {
    const response = await axiosInstance.get<FreshDealsResponse>("/fresh-deals/active-deal");
    if (response.data.success && response.data.data) {
      return {
        timer: response.data.data.timer,
        products: response.data.data.products.slice(0, 5),
      };
    }
    return { timer: null, products: [] };
  } catch (error) {
    console.error("Error in getActiveFreshDealWithProducts API:", error);
    return { timer: null, products: [] };
  }
};