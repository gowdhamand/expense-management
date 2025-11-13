export interface PaymentMethod {
  paymentMethodId: number;
  name: string;
}

// Following are the possible values for PaymentMethod
const paymentMethods = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "PayPal",
  "Bank Transfer",
  "Other",
];

// Initialize payment methods with IDs
const initializedPaymentMethods = paymentMethods.map((name, index) => ({
  paymentMethodId: index + 1,
  name,
}));

// Export initialized payment methods
export const paymentMethodsWithIds = initializedPaymentMethods;

// Export payment methods without IDs
export const paymentMethodsWithoutIds = paymentMethods;
