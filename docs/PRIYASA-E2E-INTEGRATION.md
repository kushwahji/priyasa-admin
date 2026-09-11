# PRIYASA full-stack E2E integration

## Production source of truth
The Laravel API at `https://api.priyasa.com/api/v1` is the commerce source of truth for the Store and Admin applications. The Store repository is a Next.js storefront on branch `priyasa-store`; the Admin repository is a Next.js 15 application.

## Admin authentication
1. `POST /api/v1/admin/auth/send-otp` with `{ email }`.
2. `POST /api/v1/admin/auth/verify-otp` with `{ email, otp, request_id }`.
3. Store `token` and `user` from the response in browser storage for the existing Admin shell.
4. Send `Authorization: Bearer <token>` on authenticated requests.
5. `POST /api/v1/auth/logout` invalidates the session/token where supported.

The existing Admin client already centralizes API requests, adds `X-Request-ID`, handles 401 logout, and defaults to the production API URL.

## Admin E2E surface
The Admin routes are wired to the Core API for:

- Dashboard and analytics
- Products, product variants/media and catalog operations
- Categories and collections
- Customers and customer status
- Orders, status transitions, payments and fulfilment
- Inventory and controlled stock adjustments
- Shipping, tracking, cancellation and shipment creation
- Returns and refund lifecycle
- Reviews and moderation
- Promotions/coupons
- CMS/storefront merchandising
- WhatsApp inbox, replies and template synchronization
- Integrations
- Admins/roles
- Settings and audit logs

## Store E2E contract
The Store should use the Laravel API for account, product/catalog, addresses, cart, checkout, orders, payments, wishlist, reviews and returns. Do not create a second business-authority database in the Next.js Store for order/payment/inventory state.

Core customer flow:
`send OTP -> verify OTP -> session/token -> catalog -> product -> address -> cart -> checkout validate -> create order (Idempotency-Key) -> payment -> capture/webhook -> confirmed/processing -> shipment -> tracking -> delivered -> review/return -> refund`.

## Idempotency
Use a unique `Idempotency-Key` for every retryable mutation where the API supports it, especially order creation, payment initiation/capture, cancellation, WhatsApp replies and operational mutations.

## Device/FCM
FCM device endpoints are rooted at `/api/device`, not `/api/v1/device`:
- `POST /api/device/register`
- `POST /api/device/refresh`
- `POST /api/device/update` (authenticated; server derives user identity)
- `POST /api/device/logout`
- `DELETE /api/device/delete`

The Store/Android WebView should first register the device, then call `/api/device/update` after customer authentication so the current token is associated with the authenticated customer. Do not send arbitrary `user_id` or phone values as authority.

## Integration security
Admin integration configuration uses the backend's integration endpoints and server-side credentials. Do not expose provider secrets in the browser bundle. Preserve the backend authentication/session mechanism required by those endpoints.

## Validation standard
Before production deployment, run:
- Admin TypeScript build/typecheck
- Store unit and Playwright E2E suite
- API health check
- authenticated Admin smoke checks for products/orders/customers/inventory/returns/reviews/promotions/analytics
- authenticated Store journey through checkout/payment callback/webhook and post-order lifecycle
- provider-specific shipping/payment/WhatsApp/FCM tests where provider credentials are available
