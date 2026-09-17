# PRIYASA Admin API Control Matrix

Branch: `staging`

The admin console is an API-first commerce control plane. `PriyasaCore` remains the source of truth for products, inventory, orders, payments, customers, promotions, CMS, shipping and integrations.

## Operations

| Area | API | Admin capability |
|---|---|---|
| Dashboard | `GET /admin/analytics` | KPIs, sales trend, attention queue |
| Orders | `GET /admin/orders` | Search/filter orders |
| Order detail | `GET /admin/orders/{order}` | Customer, items, payment, status history |
| Order status | `POST /admin/orders/{order}/status` | Controlled fulfilment state transitions |
| COD | `POST /admin/orders/{order}/confirm-cod` | Confirm COD |
| Refund | `POST /admin/orders/{order}/refund` | Server-side refund workflow |
| Products | `/admin/catalog/products` | CRUD, publish/draft/archive |
| Variants | `/admin/catalog/products/{product}/variants` | SKU, pricing, attributes, stock |
| Media | `/admin/catalog/products/{product}/media` | Product imagery |
| Categories | `/admin/catalog/categories` | CRUD |
| Collections | `/admin/collections` | CRUD |
| Attributes | `/admin/catalog/attributes` | Attributes/options |
| Bulk pricing | `POST /admin/catalog/products/bulk-price` | Controlled price updates |
| Inventory | `/admin/inventory` | Stock, adjustments, movements |
| Customers | `/admin/customers` | Customer 360/status |
| Promotions | `/admin/promotions` | Coupons/campaigns |
| Reviews | `/admin/reviews` | Moderation |
| Returns | `/admin/returns` | Return status |
| Shipping | `/admin/shipping/*` | Shipment/AWB/track/cancel |
| CMS | `/admin/cms/*` | Dynamic homepage, drafts, versions, publish |
| Merchandising | `/admin/merchandising/*` | Ranking/reordering |
| Settings | `/admin/settings` | Store/checkout/notification settings |
| Integrations | `/admin/integrations/*` | WooCommerce, Meta, WhatsApp |
| Notifications | `/admin/notifications/*` | Templates/outbox/test |
| Automation | `/admin/automations/*` | Automation controls |
| Admin RBAC | `/admin/admins`, `/admin/roles` | Operator lifecycle/roles |
| Audit | `/admin/audit-logs`, `/admin/ops/audit` | Trace administrative actions |
| Ops | `/admin/ops/metrics` | Runtime/operational metrics |
| Search | `/admin/search/rebuild-relations` | Search intelligence maintenance |

## Security requirements

- Every business-changing admin endpoint must remain behind `auth:sanctum` + `priyasa.admin`.
- Provider secrets must remain in PriyasaCore; the browser receives only intentionally public configuration.
- Mutating payment, shipment, integration, notification and bulk-operation requests should use idempotency where duplicate execution has side effects.
- Destructive commerce actions should be soft/controlled where possible and audited.
- Admin UI must treat HTTP 401 as session expiry and HTTP 403 as authorization failure; neither should be silently retried.

## UX target

Use a Myntra-style operations layout: persistent navigation, global search, KPI dashboard, dense filterable tables, bulk actions, detail drawers/pages, status badges, confirmation dialogs for irreversible actions, toast feedback, responsive mobile tables/cards, and clear loading/empty/error states.
