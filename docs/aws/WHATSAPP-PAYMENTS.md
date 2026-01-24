# WhatsApp Payments API Documentation

**Last Updated**: 2026-01-24  
**Region**: India Only  
**Status**: ✅ Active & Working

---

## Payment Configuration: WECARE-DIGITAL

| Setting | Value |
|---------|-------|
| Configuration Name | `WECARE-DIGITAL` |
| Status | ✅ Active |
| WABA ID | `1347766229904230` |
| Phone Number | +91 93309 94400 |

### Payment Gateway (Razorpay)

| Setting | Value |
|---------|-------|
| Gateway Type | Razorpay |
| Merchant ID (MID) | `acc_HDfub6wOfQybuH` |
| MCC | 4722 (Travel agencies and tour operators) |
| Purpose Code | 03 (Travel) |

### UPI Configuration

| Setting | Value |
|---------|-------|
| UPI VPA | `wecaredigital83.rzp@icici` |
| MCC | 4722 (Travel agencies and tour operators) |
| Purpose Code | 03 (Travel) |

---

## API Endpoints

### Razorpay API

| Resource | Value |
|----------|-------|
| API Base URL | `https://api.razorpay.com/v1` |
| Webhook URL | `https://k4vqzmi07b.execute-api.us-east-1.amazonaws.com/prod/razorpay-webhook` |
| Webhook Secret | `b@c4mk9t9Z8qLq3` |

### Razorpay Webhook Events (41 Active)

**Payment Events:**
- `payment.authorized` - Payment authorized
- `payment.captured` - Payment captured ✅
- `payment.failed` - Payment failed ❌

**Dispute Events:**
- `payment.dispute.created` - Dispute created
- `payment.dispute.won` - Dispute won
- `payment.dispute.lost` - Dispute lost
- `payment.dispute.closed` - Dispute closed
- `payment.dispute.under_review` - Under review
- `payment.dispute.action_required` - Action required

**Order Events:**
- `order.paid` - Order paid
- `order.notification.delivered` - Notification delivered
- `order.notification.failed` - Notification failed

**Invoice Events:**
- `invoice.paid` - Invoice paid
- `invoice.partially_paid` - Partially paid
- `invoice.expired` - Invoice expired

**Refund Events:**
- `refund.created` - Refund created
- `refund.processed` - Refund processed
- `refund.failed` - Refund failed
- `refund.speed_changed` - Speed changed

**Settlement Events:**
- `settlement.processed` - Settlement processed

**Payout Events:**
- `payout.initiated` - Payout initiated
- `payout.processed` - Payout processed
- `payout.reversed` - Payout reversed
- `payout.updated` - Payout updated
- `payout.rejected` - Payout rejected
- `payout.pending` - Payout pending

**Fund Account Events:**
- `fund_account.validation.completed` - Validation completed
- `fund_account.validation.failed` - Validation failed

**Payment Link Events:**
- `payment_link.paid` - Payment link paid
- `payment_link.partially_paid` - Partially paid
- `payment_link.expired` - Link expired
- `payment_link.cancelled` - Link cancelled

**Downtime Events:**
- `payment.downtime.started` - Downtime started
- `payment.downtime.updated` - Downtime updated
- `payment.downtime.resolved` - Downtime resolved

**Account Events:**
- `account.instantly_activated` - Account activated
- `account.activated_kyc_pending` - KYC pending

**Token Events:**
- `token.service_provider.activated` - Token activated
- `token.service_provider.failed` - Token failed
- `token.service_provider.cancelled` - Token cancelled
- `token.service_provider.deactivated` - Token deactivated

---

## Payment Methods Available

| Method | Status | Notes |
|--------|--------|-------|
| UPI (Native WhatsApp) | ✅ Working | Pay on WhatsApp, GPay, PhonePe, Paytm |
| UPI (via Razorpay) | ✅ Working | Through "Other Payment Methods" |
| Cards | ✅ Working | Credit/Debit cards via Razorpay |
| NetBanking | ✅ Working | All major banks via Razorpay |
| Wallets | ✅ Working | Paytm, PhonePe, etc. via Razorpay |

---

## Message Types

### 1. Interactive Order Details (Within 24h Window)

Use `payment_settings` with `payment_gateway`:

```json
{
  "type": "interactive",
  "interactive": {
    "type": "order_details",
    "header": {
      "type": "image",
      "image": { "link": "https://example.com/invoice.png" }
    },
    "body": { "text": "Your payment is overdue — please tap below to complete it 💳🤝" },
    "footer": { "text": "WECARE.DIGITAL" },
    "action": {
      "name": "review_and_pay",
      "parameters": {
        "reference_id": "WC_20260124_ORDER001",
        "type": "digital-goods",
        "payment_settings": [{
          "type": "payment_gateway",
          "payment_gateway": {
            "type": "razorpay",
            "configuration_name": "WECARE-DIGITAL"
          }
        }],
        "currency": "INR",
        "total_amount": { "value": 10000, "offset": 100 },
        "order": {
          "status": "pending",
          "items": [{
            "retailer_id": "SKU001",
            "name": "Service Fee",
            "amount": { "value": 10000, "offset": 100 },
            "quantity": 1
          }],
          "subtotal": { "value": 10000, "offset": 100 }
        }
      }
    }
  }
}
```

### 2. Order Status Update (Payment Confirmation)

```json
{
  "type": "interactive",
  "interactive": {
    "type": "order_status",
    "body": { "text": "Payment of ₹100.00 received successfully! Thank you ✅" },
    "action": {
      "name": "review_order",
      "parameters": {
        "reference_id": "WC_20260124_ORDER001",
        "order": {
          "status": "completed",
          "description": "Payment received. Thank you!"
        }
      }
    }
  }
}
```

---

## Payment Webhook Format

WhatsApp sends payment status updates via webhook:

```json
{
  "statuses": [{
    "id": "wamid.xxx",
    "recipient_id": "919876543210",
    "type": "payment",
    "status": "captured",
    "payment": {
      "reference_id": "WC_20260124_ORDER001",
      "amount": { "value": 10000, "offset": 100 },
      "currency": "INR",
      "transaction": {
        "id": "order_xxx",
        "type": "razorpay",
        "status": "success",
        "method": { "type": "upi" }
      }
    },
    "timestamp": "1706140800"
  }]
}
```

### Payment Status Values

| Status | Description |
|--------|-------------|
| `pending` | Payment initiated |
| `captured` | Payment successful ✅ |
| `failed` | Payment failed ❌ |

### Transaction Method Types

| Type | Description |
|------|-------------|
| `upi` | UPI payment (GPay, PhonePe, Paytm, etc.) |
| `card` | Credit/Debit card |
| `netbanking` | Net banking |
| `wallet` | Digital wallet |

---

## Amount Format

All amounts use `offset` for decimal precision:

| Value | Offset | Actual Amount |
|-------|--------|---------------|
| 100 | 100 | ₹1.00 |
| 1000 | 100 | ₹10.00 |
| 10000 | 100 | ₹100.00 |
| 100000 | 100 | ₹1,000.00 |

---

## Reference ID Format

Reference IDs must be unique and UPI-safe:
- Only: A-Z, a-z, 0-9, _, -
- Max length: 35 characters
- Must be unique per transaction

**Recommended format**: `WC_YYYYMMDD_ORDERID`

Example: `WC_20260124_INV001`

---

## Lambda Functions

| Function | Purpose |
|----------|---------|
| `wecare-outbound-whatsapp` | Sends payment requests (order_details) |
| `wecare-inbound-whatsapp` | Processes payment webhooks, sends order_status |

---

## Automatic Payment Flow

```
1. Dashboard sends payment request
   ↓
2. wecare-outbound-whatsapp sends order_details message
   ↓
3. Customer receives payment request in WhatsApp
   ↓
4. Customer pays via UPI/Cards/NetBanking
   ↓
5. WhatsApp sends payment webhook → SNS → wecare-inbound-whatsapp
   ↓
6. wecare-inbound-whatsapp:
   - Stores payment record in DynamoDB
   - Sends order_status message (success/failed)
   ↓
7. Customer receives payment confirmation in WhatsApp
```

---

## Payment Messages

| Event | Message |
|-------|---------|
| Payment Request | Your payment is overdue — please tap below to complete it 💳🤝 |
| Payment Success | Payment of ₹{amount} received successfully! Thank you ✅ |
| Payment Failed | Payment failed. Please try again ❌ |

---

## Razorpay Dashboard Links

| Resource | URL |
|----------|-----|
| Dashboard | https://dashboard.razorpay.com |
| API Keys | https://dashboard.razorpay.com/app/keys |
| Webhooks | https://dashboard.razorpay.com/app/webhooks |
| Transactions | https://dashboard.razorpay.com/app/payments |
| Settlements | https://dashboard.razorpay.com/app/settlements |

---

## Troubleshooting

### UPI Payment Fails
1. Check UPI VPA is configured in Meta Business Manager
2. Verify Razorpay MID is linked correctly
3. Ensure reference_id is unique and UPI-safe (no special chars)

### Payment Not Delivered
1. Check 24-hour customer service window
2. Verify phone number format (+91XXXXXXXXXX)
3. Check CloudWatch logs for errors

### Webhook Not Received
1. Verify SNS topic subscription
2. Check Lambda function permissions
3. Review CloudWatch logs for inbound handler
