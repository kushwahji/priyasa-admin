# PRIYASA full-stack E2E integration

## Production source of truth
The Laravel API at `https://api.priyasa.com/api/v1` is the commerce source of truth for the Store and Admin applications. The Store and Admin UIs must not create a second authority for catalog, cart, checkout, order, payment, inventory, return or refund state.

The Store uses `PRIYASA_API_BASE_URL` (for example `https://api.priyasa.com`) and appends `/api/v1` for Core API calls. The Admin uses the same environment variable; `NEXT_PUBLIC_API_URL` remains a backward-compatible fallback.

## Admin authentication
1. `POST /api/v1/admin/auth/send-otp` with `{ email }`.
2. `POST /api/v1/admin/auth/verify-otp` with `{ email, otp, request_id }`.
3. Store `token` and `user` from the response in browser storage for the existing Admin shell.
4. Send `Authorization: Bearer <token>` on authenticated requests.
5. Do not call `/api/v1/auth/admin/email-otp`, `/api/v1/admin/auth/resend-otp`, `/api/v1/admin/auth/cancel-otp`, or `/api/v1/auth/logout`; those are not canonical PriyasaCore Admin routes.

The Admin client centralizes API requests, adds `X-Request-ID`, handles 401 logout locally, and uses a 30-second request timeout.

## Admin E2E surface
The Admin UI is wired to the Core API for:

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
The Store should use the Laravel API for account, product/catalog, addresses, cart, checkout, orders, payments, wishlist, reviews and returns. Next.js route handlers may act as thin BFF/proxy adapters, but business state and financial authority must remain in PriyasaCore.

Core customer flow:
`send OTP -> verify OTP -> Core token/session -> catalog -> product -> address -> cart -> checkout validate -> create order (Idempotency-Key) -> payment -> capture/webhook -> confirmed/processing -> shipment -> tracking -> delivered -> review/return -> refund`.

## Idempotency
Use a unique `Idempotency-Key` for every retryable mutation where the API supports it, especially order creation, payment initiation/capture, cancellation, WhatsApp replies and operational mutations.

## Device/FCM
FCM device endpoints are rooted at `/api/device`:
- `POST /api/device/register`
- `POST /api/device/refresh`
- `POST /api/device/update` (authenticated; server derives user identity)
- `POST /api/device/logout`
- `DELETE /api/device/delete`

The Store/Android WebView should first register the device, then call `/api/device/update` after customer authentication so the current token is associated with the authenticated customer. Do not send arbitrary `user_id` or phone values as authority.

## Validation standard
Before production deployment, run:
- Admin TypeScript build/typecheck
- Store unit and Playwright E2E suite
- PriyasaCore migration/test/certification suite
- API health and public storefront smoke checks
- authenticated Admin smoke checks for products/orders/customers/inventory/returns/reviews/promotions/analytics when `PRIYASA_ADMIN_E2E_TOKEN` is configured
- authenticated Store journey through checkout/payment callback/webhook and post-order lifecycle
- provider-specific shipping/payment/WhatsApp/FCM tests where provider credentials are available
