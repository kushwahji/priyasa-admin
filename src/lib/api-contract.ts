export type Primitive = string | number | boolean | null;
export type QueryValue = Primitive | undefined;
export type Pagination = { current_page:number; last_page:number; total:number; per_page:number };
export type ApiEnvelope<T> = { success?:boolean; data?:T; message?:string; errors?:Record<string,string[]> };
export type AdminList<T> = Pagination & { data:T[] };
/** Canonical PriyasaCore /api/v1 admin contract. Keep aligned with Modules/PriyasaCore/Routes/api.php. */
export const API_ROUTES = {
 health:'/health', ready:'/ready', auth:{sendOtp:'/admin/auth/send-otp',verifyOtp:'/admin/auth/verify-otp'}, dashboard:'/admin/analytics',
 catalog:{products:'/admin/catalog/products',product:(id:string|number)=>`/admin/catalog/products/${id}`,variants:(id:string|number)=>`/admin/catalog/products/${id}/variants`,variant:(p:string|number,v:string|number)=>`/admin/catalog/products/${p}/variants/${v}`,media:(id:string|number)=>`/admin/catalog/products/${id}/media`,attributes:'/admin/catalog/attributes',attribute:(id:string|number)=>`/admin/catalog/attributes/${id}`,categories:'/admin/catalog/categories',category:(id:string|number)=>`/admin/catalog/categories/${id}`,bulkPrice:'/admin/catalog/products/bulk-price'},
 collections:{list:'/admin/collections',detail:(id:string|number)=>`/admin/collections/${id}`},
 orders:{list:'/admin/orders',detail:(id:string|number)=>`/admin/orders/${id}`,status:(id:string|number)=>`/admin/orders/${id}/status`,confirmCod:(id:string|number)=>`/admin/orders/${id}/confirm-cod`,refund:(id:string|number)=>`/admin/orders/${id}/refund`,invoice:(id:string|number)=>`/admin/orders/${id}/invoice`},
 inventory:{list:'/admin/inventory',variant:(id:string|number)=>`/admin/inventory/${id}`,adjust:(id:string|number)=>`/admin/inventory/${id}/adjust`,stock:(id:string|number)=>`/admin/inventory/${id}/stock`,movements:(id:string|number)=>`/admin/inventory/${id}/movements`,bulk:'/admin/inventory/bulk-stock'},
 customers:{list:'/admin/customers',detail:(id:string|number)=>`/admin/customers/${id}`,status:(id:string|number)=>`/admin/customers/${id}/status`},
 promotions:{list:'/admin/promotions',detail:(id:string|number)=>`/admin/promotions/${id}`,toggle:(id:string|number)=>`/admin/promotions/${id}/toggle`,campaigns:'/admin/promotions/campaigns',campaign:(id:string|number)=>`/admin/promotions/campaigns/${id}`},
 reviews:{list:'/admin/reviews',status:(id:string|number)=>`/admin/reviews/${id}/status`}, returns:{list:'/admin/returns',status:(id:string|number)=>`/admin/returns/${id}/status`},
 shipping:{shipments:'/admin/shipping/shipments',create:(orderId:string|number)=>`/admin/shipping/orders/${orderId}/shipments`,awb:(id:string|number)=>`/admin/shipping/shipments/${id}/awb`,track:(id:string|number)=>`/admin/shipping/shipments/${id}/track`,cancel:(id:string|number)=>`/admin/shipping/shipments/${id}/cancel`},
 cms:{list:'/admin/cms',detail:(id:string|number)=>`/admin/cms/${id}`,reorder:'/admin/cms/reorder',preview:'/admin/cms/preview',drafts:'/admin/cms/drafts',versions:'/admin/cms/versions',publish:(id:string|number)=>`/admin/cms/versions/${id}/publish`},
 merchandising:{products:'/admin/merchandising/products',product:(id:string|number)=>`/admin/merchandising/products/${id}`,reorder:'/admin/merchandising/products/reorder',collectionReorder:(id:string|number)=>`/admin/merchandising/collections/${id}/reorder`},
 settings:'/admin/settings', analytics:{overview:'/admin/analytics/overview',daily:'/admin/analytics/daily',products:'/admin/analytics/products',rebuild:'/admin/analytics/rebuild'}, audit:'/admin/audit-logs',
 admins:{list:'/admin/admins',roles:'/admin/roles',create:'/admin/admins',detail:(id:string|number)=>`/admin/admins/${id}`,status:(id:string|number)=>`/admin/admins/${id}/status`},
 integrations:{list:'/admin/integrations',woocommerceStatus:'/admin/integrations/woocommerce/status',woocommerceSync:'/admin/integrations/woocommerce/sync',woocommerceProductsSync:'/admin/integrations/woocommerce/sync/products',woocommerceOrdersSync:'/admin/integrations/woocommerce/sync/orders',metaStatus:'/admin/integrations/meta/status',metaConnect:'/admin/integrations/meta/connect'},
 whatsapp:{status:'/admin/whatsapp/status',conversations:'/admin/whatsapp/conversations',conversation:(phone:string)=>`/admin/whatsapp/conversations/${encodeURIComponent(phone)}`,templates:'/admin/whatsapp/templates',templateSync:'/admin/whatsapp/templates/sync',reply:(phone:string)=>`/admin/whatsapp/conversations/${encodeURIComponent(phone)}/reply`},
 notifications:{templates:'/admin/notifications/templates',outbox:'/admin/notifications/outbox',test:'/admin/notifications/test'}, automations:{list:'/admin/automations',detail:(id:string|number)=>`/admin/automations/${id}`,toggle:(id:string|number)=>`/admin/automations/${id}/toggle`},
 ops:{metrics:'/admin/ops/metrics',audit:'/admin/ops/audit'}, search:{rebuildRelations:'/admin/search/rebuild-relations'},
} as const;
export const DEVICE_API_ROOT = '/api/device';
