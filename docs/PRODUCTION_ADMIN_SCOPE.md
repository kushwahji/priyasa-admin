# Priyasa Admin — production scope

The Admin application is an API-first operations console. `https://api.priyasa.com/api/v1` remains the business source of truth; the browser never receives provider secrets and the Admin UI does not maintain a second commerce database.

## Commerce control plane

- Dashboard and operational analytics
- Product CRUD, variants, media, pricing and bulk operations
- Categories and collections
- Inventory, warehouse stock and controlled adjustments
- Orders, payments, fulfilment, cancellation and shipment workflows
- Returns, refunds and review moderation
- Customers and CRM controls
- Promotions/coupons
- CMS and dynamic storefront merchandising
- Shipping, WhatsApp, notifications and automation
- Integrations, admin RBAC, settings and audit logs

## Merchandising Studio

The new `/merchandising` workspace provides reusable templates for hero banners, image carousels, dynamic product rails, sale rails, category grids and promotional banners. It uses the existing `/admin/cms` API, so changes remain immediately controllable from the same backend contract used by the storefront.

## Production authentication

Admin OTP remains:
`POST /api/v1/admin/auth/send-otp` -> `POST /api/v1/admin/auth/verify-otp`.

Authenticated requests use the bearer token stored by the existing Admin shell. 401 responses clear the local session and return the operator to `/login`.

## Validation gate

The branch adds Playwright smoke coverage for unauthenticated redirect and the OTP login form, plus CI execution after TypeScript/build validation. Provider-dependent workflows still require staging credentials and real API access before production approval.
