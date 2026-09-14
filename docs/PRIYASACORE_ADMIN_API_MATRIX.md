# PriyasaCore Admin API Integration Matrix

Canonical base: `/api/v1`.

The admin frontend uses `PRIYASA_API_BASE_URL` and sends authenticated requests through `/api/proxy` in the browser. PriyasaCore's canonical JSON admin surface is protected by `auth:sanctum` + `priyasa.admin` (and, for sensitive areas, `priyasa.admin.security`).

## Implemented Core admin API surface

### Catalog
- `GET /admin/catalog/products`
- `GET /admin/catalog/products/{product}`
- `POST /admin/catalog/products`
- `PUT /admin/catalog/products/{product}`
- `DELETE /admin/catalog/products/{product}`
- `GET /admin/catalog/products/{product}/media`
- `POST /admin/catalog/products/{product}/media`
- `PUT /admin/catalog/products/{product}/media/{media}`
- `DELETE /admin/catalog/products/{product}/media/{media}`
- `GET /admin/catalog/products/{product}/attributes`
- `PUT /admin/catalog/products/{product}/attributes`
- `POST /admin/catalog/products/{product}/variants`
- `PUT /admin/catalog/products/{product}/variants/{variant}`
- `DELETE /admin/catalog/products/{product}/variants/{variant}`
- `POST /admin/catalog/products/{product}/variants/generate`
- `PUT /admin/catalog/products/{product}/variants/{variant}/attribute-options`
- `POST /admin/catalog/products/bulk-price`
- `GET/POST/PUT/DELETE /admin/catalog/attributes...`
- `GET/POST/PUT/DELETE /admin/catalog/categories...`
- `GET/POST/PUT/DELETE /admin/collections...`

### Customers / CRM
- `GET /admin/customers`
- `GET /admin/customers/{customer}`
- `PUT /admin/customers/{customer}`
- `POST /admin/customers/{customer}/status`
- `GET /admin/customer-360`
- `GET /admin/customer-360/{customer}`
- `POST /admin/customer-360/merge/preview`
- `POST /admin/customer-360/merge`
- `POST /admin/customer-360/{customer}/tags`
- `DELETE /admin/customer-360/{customer}/tags/{tag}`
- `POST /admin/customer-360/{customer}/notes`
- `PUT /admin/customer-360/{customer}/consents`
- `POST /admin/customer-360/{customer}/segments`

### Orders / Inventory / Returns
- `GET /admin/orders`
- `GET /admin/orders/{order}`
- `POST /admin/orders/{order}/status`
- `POST /admin/orders/{order}/confirm-cod`
- `POST /admin/orders/{order}/refund`
- `GET /admin/inventory`
- `GET /admin/inventory/{variant}`
- `POST /admin/inventory/{variant}/adjust`
- `PUT /admin/inventory/{variant}/stock`
- `GET /admin/inventory/{variant}/movements`
- `POST /admin/inventory/bulk-stock`
- `GET /admin/inventory/warehouses`
- `GET /admin/inventory/warehouse-stock`
- `POST /admin/inventory/warehouse-adjust`
- `GET /admin/returns`
- `POST /admin/returns/{return}/status`
- `POST /admin/returns/{return}/reverse-shipment`
- `POST /admin/reverse-shipments/{shipment}/status`
- `POST /admin/shipments/{shipment}/ndr`
- `POST /admin/ndr/{case}/resolve`
- `POST /admin/returns/{return}/qc`
- `POST /admin/returns/{return}/exchange`

### Fulfillment / Shipping
- `POST /admin/orders/{order}/fulfillment/allocate`
- `GET /admin/orders/{order}/fulfillment`
- `POST /admin/fulfillment/allocations/{allocation}/pick`
- `POST /admin/fulfillment/allocations/{allocation}/pack`
- `POST /admin/fulfillment/allocations/{allocation}/cancel`
- `POST /admin/fulfillment/transfers`
- `GET /admin/fulfillment/transfers`
- `POST /admin/fulfillment/transfers/{transfer}/receive`
- `POST /admin/orders/{order}/shipping/create`
- `GET /admin/orders/{order}/shipping`
- `POST /admin/shipping/{shipment}/label`
- `POST /admin/shipping/{shipment}/pickup`
- `POST /admin/shipping/{shipment}/sync`
- `POST /admin/shipping/{shipment}/cancel`
- `GET /admin/shipping/shipments`

### Promotions
- `GET /admin/promotions`
- `GET /admin/promotions/{coupon}`
- `POST /admin/promotions`
- `PUT /admin/promotions/{coupon}`
- `DELETE /admin/promotions/{coupon}`
- `POST /admin/promotions/{coupon}/toggle`
- `GET /admin/promotions/campaigns`
- `POST /admin/promotions/campaigns`
- `PUT /admin/promotions/campaigns/{campaign}`
- `POST /admin/promotions/campaigns/{campaign}/toggle`
- `GET /admin/promotions/performance`

Campaign create contract:
```json
{
  "name": "Festive Sale",
  "type": "automatic|flash_sale|segment",
  "discount_type": "percentage|fixed",
  "discount_value": 20,
  "minimum_cart_value": 499,
  "maximum_discount": 500,
  "usage_limit": 1000,
  "per_customer_limit": 1,
  "priority": 10,
  "stackable": false,
  "first_order_only": false,
  "is_active": true,
  "starts_at": "2026-10-01T00:00:00+05:30",
  "ends_at": "2026-10-15T23:59:59+05:30",
  "rules": {}
}
```

### Communications / Automation
- `GET /admin/notifications/templates`
- `POST /admin/notifications/templates`
- `GET /admin/notifications/outbox`
- `POST /admin/notifications/test`
- `GET /admin/automations`
- `PUT /admin/automations/{automation}`
- `POST /admin/automations/{automation}/toggle`
- `GET /admin/whatsapp/status`
- `GET /admin/whatsapp/templates`
- `POST /admin/whatsapp/templates/sync`
- `GET /admin/whatsapp/conversations`
- `GET /admin/whatsapp/conversations/{phone}`
- `POST /admin/whatsapp/conversations/{phone}/reply`

Notification queue contract:
```json
{
  "customer_id": 123,
  "channel": "whatsapp|push|email|sms",
  "recipient": "recipient-value",
  "template_key": "order_shipped",
  "event_key": "manual.test",
  "payload": {}
}
```

### Integrations
- `GET /admin/integrations`
- `GET /admin/integrations/meta/status`
- `GET /admin/integrations/meta/connect`
- `POST /admin/integrations/{key}/connect`
- `POST /admin/integrations/{key}/disconnect`
- `GET /admin/integrations/woocommerce/status`
- `POST /admin/integrations/woocommerce/sync`
- `POST /admin/integrations/woocommerce/sync/products`
- `POST /admin/integrations/woocommerce/sync/orders`

### CMS / Merchandising
- `GET /admin/cms`
- `POST /admin/cms`
- `GET /admin/cms/{section}`
- `PUT /admin/cms/{section}`
- `DELETE /admin/cms/{section}`
- `POST /admin/cms/reorder`
- `GET /admin/cms/preview`
- `POST /admin/cms/drafts`
- `GET /admin/cms/versions`
- `POST /admin/cms/versions/{version}/publish`
- `GET /admin/merchandising/products`
- `PATCH /admin/merchandising/products/{product}`
- `POST /admin/merchandising/products/reorder`
- `POST /admin/merchandising/collections/{collection}/reorder`

### Analytics / Control Center / Security
- `GET /admin/analytics`
- `GET /admin/analytics/overview`
- `GET /admin/analytics/daily`
- `GET /admin/analytics/products`
- `POST /admin/analytics/rebuild-daily`
- `GET /admin/control-center`
- `GET /admin/control-center/orders`
- `GET /admin/control-center/inventory`
- `GET /admin/control-center/operations`
- `GET /admin/control-center/dashboard`
- `GET /admin/control-center/customers`
- `GET /admin/control-center/products`
- `POST /admin/control-center/bulk/price`
- `GET /admin/control-center/bulk/{job}`
- `GET /admin/security/me`
- `GET /admin/security/roles`
- `GET /admin/security/permissions`
- `GET /admin/security/users`
- `POST /admin/security/users/{user}/roles/{role}`
- `DELETE /admin/security/users/{user}/roles/{role}`
- `GET /admin/security/audit`
- `GET /admin/audit-logs`
- `GET /admin/admins`
- `GET /admin/roles`
- `POST /admin/admins`
- `PUT /admin/admins/{admin}`
- `POST /admin/admins/{admin}/status`

## Backend enhancements required for full premium marketing

These are intentionally **not fabricated in the admin**. PriyasaCore currently has no canonical JSON contract for them.

### 1. Multi-channel campaign delivery
`POST /api/v1/admin/marketing/campaigns`

Request:
```json
{
  "name": "Diwali Winback",
  "status": "draft|scheduled|running|paused|completed|failed",
  "audience": {
    "segment_id": "inactive_30d",
    "filters": {"marketing_opt_in": true}
  },
  "channels": [
    {"channel":"push","template_key":"diwali_push","fallback_after_seconds":3600},
    {"channel":"whatsapp","template_key":"diwali_whatsapp","fallback_after_seconds":7200},
    {"channel":"email","template_key":"diwali_email"},
    {"channel":"rcs","template_key":"diwali_rcs"}
  ],
  "schedule": {"send_at":"2026-10-20T10:00:00+05:30","timezone":"Asia/Kolkata"},
  "frequency_cap": {"per_customer_per_24h":1},
  "quiet_hours": {"start":"21:00","end":"09:00"},
  "goal": {"type":"order","window_hours":72}
}
```
Response `201`:
```json
{"data":{"id":"cmp_123","status":"scheduled","audience_count":12500,"estimated_recipients":11820}}
```

### 2. Campaign execution controls
- `GET /api/v1/admin/marketing/campaigns`
- `GET /api/v1/admin/marketing/campaigns/{campaign}`
- `POST /api/v1/admin/marketing/campaigns/{campaign}/schedule`
- `POST /api/v1/admin/marketing/campaigns/{campaign}/pause`
- `POST /api/v1/admin/marketing/campaigns/{campaign}/resume`
- `POST /api/v1/admin/marketing/campaigns/{campaign}/cancel`
- `POST /api/v1/admin/marketing/campaigns/{campaign}/send-test`
- `GET /api/v1/admin/marketing/campaigns/{campaign}/stats`

### 3. Audience / segment management
- `GET /api/v1/admin/marketing/segments`
- `POST /api/v1/admin/marketing/segments`
- `PUT /api/v1/admin/marketing/segments/{segment}`
- `DELETE /api/v1/admin/marketing/segments/{segment}`
- `POST /api/v1/admin/marketing/segments/{segment}/preview`
- `GET /api/v1/admin/marketing/segments/{segment}/count`

Segment request:
```json
{
  "name":"Inactive high-value buyers",
  "logic":"AND",
  "rules":[
    {"field":"last_order_at","operator":"before_days","value":60},
    {"field":"lifetime_value","operator":"gte","value":5000},
    {"field":"marketing_opt_in","operator":"eq","value":true}
  ]
}
```

### 4. RCS provider
- `GET /api/v1/admin/integrations/rcs/status`
- `POST /api/v1/admin/integrations/rcs/connect`
- `POST /api/v1/admin/integrations/rcs/disconnect`
- `GET /api/v1/admin/rcs/templates`
- `POST /api/v1/admin/rcs/templates/sync`
- `POST /api/v1/admin/rcs/send`
- `GET /api/v1/admin/rcs/deliveries`

RCS send contract:
```json
{
  "customer_id":123,
  "recipient":"919876543210",
  "template_key":"promo_carousel_01",
  "locale":"en-IN",
  "parameters":{},
  "campaign_id":"cmp_123"
}
```

### 5. Unified delivery events / attribution
`POST /api/v1/admin/marketing/events` for provider callbacks or internal normalized events.

```json
{
  "campaign_id":"cmp_123",
  "delivery_id":"del_456",
  "channel":"push|email|whatsapp|rcs",
  "event":"queued|sent|delivered|opened|clicked|failed|converted|unsubscribed",
  "provider_message_id":"provider-id",
  "occurred_at":"2026-10-20T10:01:00Z",
  "metadata":{}
}
```

### 6. Provider health / routing
`GET /api/v1/admin/marketing/providers`

Return:
```json
{
  "data":[
    {"channel":"push","provider":"fcm","status":"healthy","latency_ms":120},
    {"channel":"email","provider":"smtp","status":"healthy","latency_ms":240},
    {"channel":"whatsapp","provider":"meta","status":"healthy","latency_ms":310},
    {"channel":"rcs","provider":"provider-name","status":"not_configured","latency_ms":null}
  ]
}
```

## Idempotency / security requirements

All mutating campaign, delivery, template-sync, provider and audience operations should support `Idempotency-Key`. Sensitive admin endpoints should enforce `auth:sanctum`, `priyasa.admin`, `priyasa.admin.security`, and explicit permission middleware. Never return provider secrets to the admin UI. All delivery callbacks should be authenticated/signed and normalized before persistence.
