# PriyasaCore Commerce Command Center

The admin application is now organized as a single commerce control plane over `PriyasaCore` with `CommerceAutomation` retained as the growth/integration layer.

## Source-of-truth boundary

- **PriyasaCore** owns products, variants, media, categories, collections, pricing, inventory, customers, carts, checkout, orders, payments, shipping, returns/refunds, reviews, promotions, CMS and audit/governance APIs.
- **CommerceAutomation** owns WhatsApp, FCM, AI agent workflows, templates, delivery automation, WooCommerce/custom commerce connectors, Meta Ads, audiences, catalogs and growth campaigns.
- The admin UI must call the existing APIs rather than maintain a second commerce database or duplicate business rules.

## Storefront CMS

`/cms` is a visual management surface over `/api/v1/admin/cms` and `/api/v1/admin/cms/reorder`.

Supported block presets are intentionally data-driven:

- `banner`
- `product_carousel`
- `product_grid`
- `collection`
- `promo_strip`
- `rich_content`

Block-specific data belongs in the CMS `content` JSON object. The storefront reads published sections from `/api/v1/storefront/home`.

## Growth bridge

Set `NEXT_PUBLIC_COMMERCE_AUTOMATION_URL` when the CommerceAutomation web admin is hosted separately. The default is `/admin/commerce` for same-origin deployments.

The `/ads` admin surface links to the existing CommerceAutomation Ads Center, audiences and catalogs instead of rebuilding Meta Ads functionality in Next.js.

## Production expectations

1. Configure the API base with `NEXT_PUBLIC_API_URL`.
2. Use the PriyasaCore admin OTP/Sanctum authentication flow already provided by the API.
3. Keep provider credentials server-side; never put Meta, WhatsApp, Razorpay, Shiprocket or FCM secrets in the Next.js client bundle.
4. Run `npm run typecheck` and `npm run build` before deployment.
5. Verify an authenticated E2E path: login → catalog → product/variant → inventory → CMS publish → storefront home → cart/checkout → order → payment → shipment/return, plus automation event delivery.
