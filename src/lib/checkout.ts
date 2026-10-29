export type DeliveryMethod = "pickup" | "courier";
// `pickup` = paid at our office (value kept from before delivery methods existed).
export type PaymentMethod = "pickup" | "bank_transfer" | "cash_on_delivery";

// Which payments each delivery method allows. Shared by the form and the server check.
export const paymentsFor: Record<DeliveryMethod, PaymentMethod[]> = {
  pickup: ["pickup", "bank_transfer"],
  courier: ["cash_on_delivery", "bank_transfer"],
};
