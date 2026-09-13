export type AdminCapability={key:string;label:string;description:string;prefixes:string[];path:string;icon?:string};

export const ADMIN_CAPABILITIES:AdminCapability[]=[
 {key:'dashboard',label:'Control Center',description:'Live commerce health, sales, operational attention and cross-domain command links.',prefixes:['/admin/control-center','/admin/analytics'],path:'/'},
 {key:'catalog',label:'Catalog',description:'Products, variants, attributes, media, categories and collections.',prefixes:['/admin/catalog','/admin/collections'],path:'/products'},
 {key:'inventory',label:'Inventory',description:'Stock, movements, warehouses, reservations and transfers.',prefixes:['/admin/inventory','/admin/fulfillment','/admin/actions/inventory'],path:'/inventory'},
 {key:'orders',label:'Orders',description:'Order lifecycle, COD confirmation, fulfillment, invoices, refunds and shipping.',prefixes:['/admin/orders','/admin/actions/orders'],path:'/orders'},
 {key:'customers',label:'Customers',description:'Customer accounts, Customer 360, segments, tags, notes and status.',prefixes:['/admin/customers','/admin/customer-360','/admin/control-center/customers'],path:'/customers'},
 {key:'marketing',label:'Marketing',description:'Coupons, campaigns, promotion performance and merchandising.',prefixes:['/admin/promotions','/admin/merchandising'],path:'/promotions'},
 {key:'returns',label:'Returns & Reverse Logistics',description:'Return requests, QC, exchanges, reverse shipments, NDR and refunds.',prefixes:['/admin/returns','/admin/reverse-shipments','/admin/ndr','/admin/shipments'],path:'/returns'},
 {key:'shipping',label:'Shipping & Fulfillment',description:'Shipments, AWB, pickup, tracking, labels and allocation workflows.',prefixes:['/admin/shipping','/admin/fulfillment'],path:'/shipping'},
 {key:'website',label:'Website & CMS',description:'Homepage sections, drafts, versions, publishing and ordering.',prefixes:['/admin/cms'],path:'/cms'},
 {key:'communications',label:'Communications',description:'Notification templates, outbox, WhatsApp conversations and operational messaging.',prefixes:['/admin/notifications','/admin/whatsapp'],path:'/notifications'},
 {key:'support',label:'Support Command Center',description:'Tickets, order command center, customer messages and resolution actions.',prefixes:['/admin/support'],path:'/support'},
 {key:'analytics',label:'Analytics & Finance',description:'Sales, products, daily metrics and finance reporting.',prefixes:['/admin/analytics','/admin/finance'],path:'/analytics'},
 {key:'automation',label:'Automation & AI',description:'Automation rules, commerce-agent conversations and AI-assisted content/actions.',prefixes:['/admin/automations','/admin/commerce-agent','/admin/ai'],path:'/automation'},
 {key:'integrations',label:'Integrations',description:'Meta, WooCommerce and provider connection/synchronization controls.',prefixes:['/admin/integrations'],path:'/integrations'},
 {key:'security',label:'Security & Access',description:'Admins, roles, permissions, security context and audit trails.',prefixes:['/admin/admins','/admin/roles','/admin/security','/admin/audit-logs','/admin/ops/audit'],path:'/admins'},
 {key:'operations',label:'Operations Reliability',description:'Health, metrics, reservations, bulk jobs and administrative action endpoints.',prefixes:['/admin/ops','/admin/actions','/admin/search'],path:'/api-ops'},
];

export function capabilityForRoute(uri:string){
 return ADMIN_CAPABILITIES.find(c=>c.prefixes.some(prefix=>uri===prefix||uri.startsWith(`${prefix}/`)))||ADMIN_CAPABILITIES.find(c=>c.key==='operations')!;
}
