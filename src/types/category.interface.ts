// Common API response template format
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

// Main Category interface
export interface ICategory {
  _id?: string;        // MongoDB ObjectId (optional/flexible jate dynamic database er sathe kaj kore)
  id?: string | number; // Fallback traditional ID if needed
  name: string;        // Category name (e.g., 'Vegetables')
  title?: string;      // Fallback/alternative field for naming consistency
  slug: string;        // SEO friendly URL slug (e.g., 'vegetables')
  icon?: string;       // Icon URL link coming from your backend (Cloudinary/ImgBB)
  image?: string;      // Image URL link
  status: "Active" | "Inactive"; // Status configuration field
  isDeleted: boolean;  // Soft delete flag indicator
  createdAt?: string;
  updatedAt?: string;
  subCategories?: ISubCategory[];
}

export interface ISubCategory {
  _id: string;
  title: string;
  status: "Active" | "Inactive";
}