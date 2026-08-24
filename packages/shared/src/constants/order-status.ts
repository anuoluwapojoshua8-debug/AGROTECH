export const ORDER_STATUS_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED: [],
} as const;

export const PAYMENT_METHOD_LABELS = {
  CARD: 'Card Payment',
  BANK_TRANSFER: 'Bank Transfer',
  USSD: 'USSD',
  WALLET: 'Wallet',
  PAYSTACK: 'Paystack',
  FLUTTERWAVE: 'Flutterwave',
} as const;
