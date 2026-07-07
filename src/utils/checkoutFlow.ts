import { useRouter } from "next/navigation";
import { CartItem, CheckoutOrderPayload } from "@/src/types/checkout.interface";
import { getUserAddresses } from "@/src/api/checkout";

const CHECKOUT_STORAGE_KEY = "checkoutOrder";
const DEFAULT_DELIVERY_CHARGE = 50;

const getUserIdFromToken = (token: string): string | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.id || decoded._id || decoded.userId || null;
  } catch {
    return null;
  }
};

// 💡 একটা মাত্র product থেকে "Buy Now"-এর জন্য single-item order payload বানানো —
// cart-এর অন্য কোনো আইটেমের তথ্য এখানে আসবে না।
export const buildSingleItemCheckoutPayload = (
  item: CartItem,
  deliveryCharge: number = DEFAULT_DELIVERY_CHARGE,
): CheckoutOrderPayload => {
  const subtotal = item.price * item.quantity;
  return {
    items: [item],
    subtotal,
    deliveryCharge,
    discount: 0,
    appliedCoupons: [],
    total: subtotal + deliveryCharge,
  };
};

// 💡 cart checkout আর buy-now — দুটোই এই একই ফাংশন কল করবে।
// এটা শুধু payload localStorage-এ সেভ করে, লগইন/address চেক করে সঠিক পেজে রাউট করে।
export const proceedToCheckout = async (
  orderPayload: CheckoutOrderPayload,
  router: ReturnType<typeof useRouter>,
): Promise<void> => {
  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(orderPayload));

  const token = localStorage.getItem("token") || localStorage.getItem("refreshToken");
  if (!token) {
    router.push("/checkout-withoutsaveandlogout");
    return;
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    router.push("/checkout-withoutsaveandlogout");
    return;
  }

  try {
    const addresses = await getUserAddresses(userId);
    if (addresses.length > 0) {
      router.push("/checkout-alreadysaveaddress");
    } else {
      router.push("/checkout-withoutsaveandlogout");
    }
  } catch (error) {
    console.error("Address checking failed:", error);
    router.push("/checkout-withoutsaveandlogout");
  }
};