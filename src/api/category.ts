import axios from "axios";
import axiosInstance from "./axiosInstance";
import { ApiResponse, ICategory } from "../types/category.interface";

export const getActiveCategories = async (): Promise<ICategory[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<ICategory[]>>("/categories");

    if (response.data.success) {
      // Shudhu active categories gulo filter kore return korbe
      return response.data.data.filter((cat) => cat.status === "Active");
    }

    throw new Error(response.data.message || "Failed to fetch categories");
  } catch (error: unknown) {
    console.error("Error in getActiveCategories API call:", error);

    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Something went wrong");
  }
};