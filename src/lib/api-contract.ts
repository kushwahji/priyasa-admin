export type Primitive = string | number | boolean | null;
export type QueryValue = Primitive | undefined;

export type Pagination = {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
};

export type AdminList<T> = Pagination & { data: T[] };

export type CheckoutPreview = {
  subtotal?: number;
  discount?: number;
  shipping?: number;
  cod_fee?: number;
  tax?: number;
  total?: number;
  coupon?: unknown;
  items?: unknown[];
};

export const API_ROUTES = {
  health: '/health',
  auth: {
    sendOtp: '/admin/auth/send-otp',
    verifyOtp: '/admin/auth/verify-otp',
    resendOtp: '/admin/auth/resend-otp',
    cancelOtp: (requestId: string) => `/admin/auth/cancel-otp/${encodeURIComponent(requestId)}`,
    logout: '/auth/logout',
  },
  catalog: {
    products: '/admin/catalog/products',
    product: (id: string | number) => `/admin/catalog/products/${id}`,
    variants: (id: string | number) => `/admin/catalog/products/${id}/variants`,
    variant: (productId: string | number, variantId: string | number) => `/admin/catalog/products/${productId}/variants/${variantId}`,
    media: (productId: string | number) => `/admin/catalog/products/${productId}/media`,
  },
  orders: {
    list: '/admin/orders',
    detail: (id: string | number) => `/admin/orders/${id}`,
    status: (id: string | number) => `/admin/orders/${id}/status`,
    shipment: (id: string | number) => `/admin/orders/${id}/shipment`,
  },
  inventory: {
    list: '/admin/inventory',
    adjust: (variantId: string | number) => `/admin/inventory/${variantId}/adjust`,
  },
  shipments: {
    list: '/admin/shipping/shipments',
    detail: (id: string | number) => `/admin/shipments/${id}`,
    cancel: (id: string | number) => `/admin/shipments/${id}/cancel`,
  },
  customers: {
    list: '/admin/customers',
    detail: (id: string | number) => `/admin/customers/${id}`,
    status: (id: string | number) => `/admin/customers/${id}/status`,
  },
  returns: {
    list: '/admin/returns',
    status: (id: string | number) => `/admin/returns/${id}/status`,
  },
  reviews: {
    list: '/admin/reviews',
    status: (id: string | number) => `/admin/reviews/${id}/status`,
  },
  promotions: {
    list: '/admin/promotions',
    detail: (id: string | number) => `/admin/promotions/${id}`,
    toggle: (id: string | number) => `/admin/promotions/${id}/toggle`,
  },
  cms: {
    list: '/admin/cms',
    detail: (id: string | number) => `/admin/cms/${id}`,
  },
  analytics: '/admin/analytics',
  settings: '/admin/settings',
  audit: '/admin/audit-logs',
  integrations: '/admin/integrations',
  whatsapp: {
    status: '/admin/whatsapp/status',
    conversations: '/admin/whatsapp/conversations',
    templates: '/admin/whatsapp/templates',
    templateSync: '/admin/whatsapp/templates/sync',
    reply: '/admin/whatsapp/reply',
    messages: (phone: string) => `/admin/whatsapp/conversations/${encodeURIComponent(phone)}/messages`,
  },
} as const;

export const DEVICE_API_ROOT = '/api/device';
