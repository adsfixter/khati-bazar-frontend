// src/types/dashboard.ts
export interface OrderRow {
  id: string;
  date: string;
  items: number;
  amount: number;
  status: "Delivered" | "Processing" | "Canceled";
}

export interface NotificationItem {
  id: string;
  type: "info" | "promo" | "success" | "warning";
  message: string;
  time: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
  memberSince: string;
  avatarLetter: string;
}

export interface DashboardStats {
  totalSpend: number;
  totalOrders: number;
  wishlistItems: number;
  savedAddresses: number;
  reviewsGiven: number;
}